use crate::graph_description::Unit;
use crate::node::{ NodeT, MergeableNodeT };

use crate::sessions::UnidSession;

use log::warn;
use serde_json::{json, Value};
use uuid::Uuid;

impl Unit {
    pub fn new() -> Self {
        Self {
            node_key: String::from("")
        }
    }

    pub fn into_json(self) -> Value {
        json!({ "node_key": self.node_key, })
    }
}

impl NodeT for Unit {
    fn get_asset_id(&self) -> Option<&str> {
        None
    }

    fn set_asset_id(&mut self, asset_id: String) {
        ()
    }

    fn create_static_node_key(&self) -> Option<String> {
        Some(String::from("unit"))
    }

    fn get_node_key(&self) -> &str {
        &self.node_key
    }

    fn set_node_key(&mut self, node_key: String) {
        self.node_key = node_key.into();
    }

    fn into_unid_session(&self) -> Result<Option<UnidSession>, failure::Error> {
        // Trivial case, no unid session.
        Ok(None)
    }
}

impl MergeableNodeT for Unit {
    fn merge(&mut self, other: &Self) -> bool {
        if self.node_key != other.node_key {
            warn!("Attempted to merge two Unit Nodes with differing node_keys");
            return false;
        }
        true
    }

    fn merge_into(&mut self, other: Self) -> bool {
        if self.node_key != other.node_key {
            warn!("Attempted to merge two Unit Nodes with differing node_keys");
            return false;
        }

        true
    }
}
