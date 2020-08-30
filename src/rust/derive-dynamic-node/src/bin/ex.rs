use log::info;

use serde_derive::Deserialize;

use derive_dynamic_node::{DynamicNode, GraplStaticId, ModelPlugin};
use grapl_graph_descriptions::graph_description::*;

fn read_log() -> String {
    String::from(
        r#"{
            "arn": "arn:aws:ec2:us-west-2:111122223333:instance/i-00000002",
            "imageId": "ami-99999999",
            "instanceId": "i-00000002",
            "instanceType": "t2.micro",
            "launchTime": 1583191153000
    }"#,
    )
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct InstanceDetails {
    arn: String,
    image_id: String,
    instance_id: String,
    instance_type: String,
    launch_time: u64,
}

#[derive(DynamicNode, GraplStaticId, ModelPlugin)]
pub struct AwsEc2Instance {
    #[grapl(static_id)]
    pub arn: String,
    #[grapl(static_id)]
    pub launch_time: u64,
}

impl IAwsEc2InstanceNode for AwsEc2InstanceNode {
    fn get_mut_dynamic_node(&mut self) -> &mut DynamicNode {
        &mut self.dynamic_node
    }

    fn with_arn(&mut self, arn: impl Into<String>) -> &mut Self {
        info!("custom arn handler");
        self.get_mut_dynamic_node().set_property("arn", arn.into());
        self
    }
}

#[allow(dead_code)]
fn main() {
    let raw_guard_duty_alert = read_log();

    let log: InstanceDetails = serde_json::from_str(&raw_guard_duty_alert).unwrap();

    let mut ec2 = AwsEc2InstanceNode::new(AwsEc2InstanceNode::static_strategy(), log.launch_time);
    ec2.with_arn(log.arn).with_launch_time(log.launch_time);
    ec2.with_asset_id("".to_string());

    let mut graph = Graph::new(log.launch_time);
    graph.add_node(ec2);
}
