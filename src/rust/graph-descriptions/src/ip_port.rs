use log::warn;
use serde_json::{json, Value};

use sha2::Digest;

use crate::sessions::UnidSession;

use crate::graph_description::IpPort;
use crate::node::NodeT;

impl IpPort {
    pub fn new(ip_address: impl Into<String>, port: u16, protocol: impl Into<String>) -> Self {
        let ip_address = ip_address.into();
        let protocol = protocol.into();

        Self {
            node_key: format!("{}{}{}", ip_address, port, protocol),
            ip_address,
            port: port as u32,
            protocol,
        }
    }

    pub fn into_json(self) -> Value {
        json!({
            "node_key": self.node_key,
            "dgraph.type": "IpPort",
            "port": self.port,
            "protocol": self.protocol,
        })
    }
}

impl NodeT for IpPort {
    fn get_asset_id(&self) -> Option<&str> {
        None
    }

    fn set_asset_id(&mut self, _asset_id: impl Into<String>) {
        panic!("Can not set asset_id on IpPort");
    }

    fn create_static_node_key(&self) -> Option<String> {
        let port = &self.port;
        let protocol = &self.protocol;

        let mut node_key_hasher = sha2::Sha256::default();
        node_key_hasher.input(port.to_string().as_bytes());
        node_key_hasher.input(protocol.as_bytes());

        Some(hex::encode(node_key_hasher.result()))
    }

    fn get_node_key(&self) -> &str {
        &self.node_key
    }

    fn set_node_key(&mut self, node_key: impl Into<String>) {
        self.node_key = node_key.into();
    }

    fn into_unid_session(&self) -> Result<Option<UnidSession>, failure::Error> {
        // Trivial case, no unid session.
        Ok(None)
    }

    fn merge(&mut self, other: &Self) -> bool {
        if self.node_key != other.node_key {
            warn!("Attempted to merge two IpPort Nodes with differing node_keys");
            return false;
        }

        if self.ip_address != other.ip_address {
            warn!("Attempted to merge two IpPort Nodes with differing IPs");
            return false;
        }

        // There is no variable information in an IpPort
        false
    }

    fn merge_into(&mut self, _other: Self) -> bool {
        false
    }
}
