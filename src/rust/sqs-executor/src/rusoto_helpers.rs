use rusoto_core::RusotoError;
use rusoto_sqs::{
    DeleteMessageError as InnerDeleteMessageError, DeleteMessageRequest, Message as SqsMessage,
    ReceiveMessageError as InnerReceiveMessageError, ReceiveMessageRequest, SendMessageRequest,
    Sqs,
};
use tap::prelude::*;

use rusoto_s3::PutObjectError as InnerPutObjectError;

use tokio::task::{JoinError, JoinHandle};
use tokio::time::Elapsed;

use crate::errors::{CheckedError, Recoverable};
use grapl_observe::metric_reporter::{tag, MetricReporter};
use grapl_observe::timers::{time_fut_ms, TimedFutureExt};
use std::io::Stdout;
use tracing::{debug, error, info, warn};

impl CheckedError for InnerDeleteMessageError {
    fn error_type(&self) -> Recoverable {
        match self {
            InnerDeleteMessageError::InvalidIdFormat(_) => Recoverable::Persistent,
            InnerDeleteMessageError::ReceiptHandleIsInvalid(_) => Recoverable::Persistent,
        }
    }
}

// PutObjectError has no variants, and conveys no information
// about what went wrong, so we must assume a transient error
impl CheckedError for InnerPutObjectError {
    fn error_type(&self) -> Recoverable {
        match self {
            _ => Recoverable::Transient,
        }
    }
}

impl<E> CheckedError for RusotoError<E>
where
    E: CheckedError + 'static,
{
    /// In all cases, other than Service there's no way to inspect the error
    /// since it's just a String, so we default to assuming it's transient, even though
    /// that may not always be the case.
    fn error_type(&self) -> Recoverable {
        match self {
            RusotoError::Service(e) => e.error_type(),
            RusotoError::HttpDispatch(_)
            | RusotoError::Credentials(_)
            | RusotoError::Validation(_)
            | RusotoError::ParseError(_)
            | RusotoError::Unknown(_)
            | RusotoError::Blocking => Recoverable::Transient,
            // // Unfortunately there's no enum stating *what* the error is
            // // but possible errors would include timeouts etc, which are transient
            // RusotoError::HttpDispatch(e) => {
            //     Recoverable::Transient
            // }
            // RusotoError::Credentials(_) => {
            //     // todo: Reasonable
            //     Recoverable::Transient
            // }
            // RusotoError::Validation(_) => {
            //     // todo: Reasonable?
            //     Recoverable::Transient
            // }
            // RusotoError::ParseError(_) => {
            //     // todo: Is this reasonable?
            //     Recoverable::Transient
            // }
            // RusotoError::Unknown(_) => {
            //     Recoverable::Transient
            // }
            // RusotoError::Blocking => {
            //     Recoverable::Transient
            // }
        }
    }
}

pub async fn get_message<SqsT>(
    queue_url: String,
    sqs_client: SqsT,
    metric_reporter: &mut MetricReporter<Stdout>,
) -> Result<Vec<SqsMessage>, RusotoError<InnerReceiveMessageError>>
where
    SqsT: Sqs + Clone + Send + Sync + 'static,
{
    const wait_time_seconds: i64 = 20;
    let messages = sqs_client.receive_message(ReceiveMessageRequest {
        max_number_of_messages: Some(10),
        queue_url,
        visibility_timeout: Some(30),
        wait_time_seconds: Some(wait_time_seconds),
        ..Default::default()
    });

    let messages = tokio::time::timeout(
        std::time::Duration::from_secs((wait_time_seconds as u64) + 1),
        messages,
    );
    let (messages, ms) = time_fut_ms(messages).await;

    metric_reporter.histogram("sqs_executor.receive_message", ms as f64, &[]);

    let messages = messages
        .expect("timeout")?
        .messages
        .unwrap_or_else(|| vec![]);

    Ok(messages)
}

#[derive(thiserror::Error, Debug)]
pub enum SendMessageError {
    #[error("SendMessageError {0}")]
    InnerSendMessageError(#[from] RusotoError<rusoto_sqs::SendMessageError>),
    #[error("SendMessage Elapsed {0}")]
    Timeout(#[from] Elapsed),
}

impl CheckedError for rusoto_sqs::SendMessageError {
    fn error_type(&self) -> Recoverable {
        Recoverable::Persistent
    }
}

impl CheckedError for SendMessageError {
    fn error_type(&self) -> Recoverable {
        match self {
            Self::InnerSendMessageError(e) => e.error_type(),
            _ => Recoverable::Transient,
        }
    }
}

pub fn send_message<SqsT>(
    queue_url: String,
    message_body: String,
    sqs_client: SqsT,
    mut metric_reporter: MetricReporter<Stdout>,
) -> JoinHandle<Result<(), SendMessageError>>
where
    SqsT: Sqs + Clone + Send + Sync + 'static,
{
    tokio::task::spawn(async move {
        let metric_reporter = &mut metric_reporter;
        let mut last_err = None;
        for _ in 0..5u8 {
            let sqs_client = sqs_client.clone();
            let res = sqs_client.send_message(SendMessageRequest {
                queue_url: queue_url.clone(),
                message_body: message_body.clone(),
                ..Default::default()
            });

            let res = tokio::time::timeout(std::time::Duration::from_secs(21), res)
                .timed()
                .await;

            match res {
                (Ok(Ok(_)), ms) => {
                    metric_reporter.histogram(
                        "sqs_executor.send_message.ms",
                        ms as f64,
                        &[tag("success", true)],
                    );
                    debug!("Send message: {}", queue_url.clone());
                    return Ok(());
                }
                (Ok(Err(e)), ms) => {
                    metric_reporter.histogram(
                        "sqs_executor.send_message.ms",
                        ms as f64,
                        &[tag("success", false)],
                    );
                    debug!("Send message: {}", queue_url.clone());
                    if let Recoverable::Persistent = e.error_type() {
                        return Err(SendMessageError::from(e));
                    } else {
                        last_err = Some(SendMessageError::from(e));
                    }
                }
                (Err(e), ms) => {
                    metric_reporter.histogram(
                        "sqs_executor.send_message.ms",
                        ms as f64,
                        &[tag("success", false)],
                    );
                    error!("Timed out sending message {:?}", e);
                    last_err = Some(SendMessageError::from(e));
                }
            }
        }
        Err(last_err.unwrap())
    })
}

pub fn delete_message<SqsT>(
    sqs_client: SqsT,
    queue_url: String,
    receipt_handle: String,
    mut metric_reporter: MetricReporter<Stdout>,
) -> tokio::task::JoinHandle<()>
where
    SqsT: Sqs + Clone + Send + Sync + 'static,
{
    tokio::task::spawn(async move {
        let metric_reporter = &mut metric_reporter;
        for _ in 0..5u8 {
            match sqs_client
                .clone()
                .delete_message(DeleteMessageRequest {
                    queue_url: queue_url.clone(),
                    receipt_handle: receipt_handle.clone(),
                })
                .timed()
                .await
            {
                (Ok(_), ms) => {
                    metric_reporter
                        .histogram(
                            "sqs_executor.delete_message.ms",
                            ms as f64,
                            &[tag("success", true)],
                        )
                        .unwrap_or_else(|e| error!("sqs_executor.delete_message.ms: {:?}", e));
                    debug!("Deleted message: {}", receipt_handle.clone());
                    return;
                }
                (Err(e), ms) => {
                    metric_reporter
                        .histogram(
                            "sqs_executor.delete_message.ms",
                            ms as f64,
                            &[tag("success", false)],
                        )
                        .unwrap_or_else(|e| error!("sqs_executor.delete_message.ms: {:?}", e));
                    error!(
                        "Failed to delete_message with: {:?} {:?}",
                        e,
                        e.error_type()
                    );
                    if let Recoverable::Persistent = e.error_type() {
                        return;
                    }
                }
            }
        }
    })
}

#[derive(thiserror::Error, Debug)]
pub enum MoveToDeadLetterError {
    #[error("SerializeError {0}")]
    SerializeError(#[from] serde_json::Error),
    #[error("SendMessageError {0}")]
    SendMessageError(#[from] SendMessageError),
    #[error("DeleteMessageError {0}")]
    DeleteMessageError(#[from] InnerDeleteMessageError),
    #[error("JoinError {0}")]
    JoinError(#[from] JoinError),
}

pub async fn move_to_dead_letter<SqsT>(
    sqs_client: SqsT,
    message: &impl serde::Serialize,
    publish_to_queue: String,
    delete_from_queue: String,
    receipt_handle: String,
    metric_reporter: MetricReporter<Stdout>,
) -> Result<(), MoveToDeadLetterError>
where
    SqsT: Sqs + Clone + Send + Sync + 'static,
{
    let message = serde_json::to_string(&message);
    let message = message?;
    send_message(
        publish_to_queue,
        message,
        sqs_client.clone(),
        metric_reporter.clone(),
    )
    .await??;
    delete_message(
        sqs_client,
        delete_from_queue,
        receipt_handle,
        metric_reporter,
    )
    .await?;
    Ok(())
}