use log::warn;
use serde_json::Value;

use failure::{bail, Error};

use crate::sessions::UnidSession;
use crate::graph_description::IdStrategy;
use crate::graph_description::node::WhichNode;
use crate::graph_description::{
    Asset, DynamicNode, File, IpAddress, IpConnection, IpPort, NetworkConnection, Node, Process,
    ProcessInboundConnection, ProcessOutboundConnection,
};

pub trait NodeT {
    fn get_asset_id(&self) -> Option<&str>;

    fn clone_asset_id(&self) -> Option<String> {
        self.get_asset_id().map(String::from)
    }

    fn set_asset_id(&mut self, asset_id: String);

    fn create_static_node_key(&self) -> Option<String>;

    fn get_node_key(&self) -> &str;

    fn clone_node_key(&self) -> String {
        self.get_node_key().to_string()
    }

    fn set_node_key(&mut self, node_key: String);

    fn into_unid_session(&self) -> Result<Option<UnidSession>, Error>;
}

pub trait MergeableNodeT {
    fn merge(&mut self, other: &Self) -> bool;

    fn merge_into(&mut self, other: Self) -> bool;
}

impl From<IpConnection> for Node {
    fn from(ip_connection: IpConnection) -> Self {
        Self {
            which_node: Some(WhichNode::IpConnectionNode(ip_connection)),
        }
    }
}

impl From<Asset> for Node {
    fn from(asset: Asset) -> Self {
        Self {
            which_node: Some(WhichNode::AssetNode(asset)),
        }
    }
}

impl From<Process> for Node {
    fn from(process: Process) -> Self {
        Self {
            which_node: Some(WhichNode::ProcessNode(process)),
        }
    }
}

impl From<File> for Node {
    fn from(file: File) -> Self {
        Self {
            which_node: Some(WhichNode::FileNode(file)),
        }
    }
}

impl From<IpAddress> for Node {
    fn from(ip_address: IpAddress) -> Self {
        Self {
            which_node: Some(WhichNode::IpAddressNode(ip_address)),
        }
    }
}

impl From<ProcessOutboundConnection> for Node {
    fn from(process_outbound_connection: ProcessOutboundConnection) -> Self {
        Self {
            which_node: Some(WhichNode::ProcessOutboundConnectionNode(
                process_outbound_connection,
            )),
        }
    }
}

impl From<ProcessInboundConnection> for Node {
    fn from(process_inbound_connection: ProcessInboundConnection) -> Self {
        Self {
            which_node: Some(WhichNode::ProcessInboundConnectionNode(
                process_inbound_connection,
            )),
        }
    }
}

impl From<IpPort> for Node {
    fn from(ip_port: IpPort) -> Self {
        Self {
            which_node: Some(WhichNode::IpPortNode(ip_port)),
        }
    }
}

impl From<NetworkConnection> for Node {
    fn from(network_connection: NetworkConnection) -> Self {
        Self {
            which_node: Some(WhichNode::NetworkConnectionNode(network_connection)),
        }
    }
}

impl From<DynamicNode> for Node {
    fn from(dynamic_node: DynamicNode) -> Self {
        Self {
            which_node: Some(WhichNode::DynamicNode(dynamic_node)),
        }
    }
}

impl Node {
    pub fn into_inner_nodet(self) -> Box<dyn NodeT> {
        match self.which_node {
            Some(WhichNode::IpAddressNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::IpPortNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::AssetNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::ProcessNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::FileNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::ProcessInboundConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::ProcessOutboundConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::NetworkConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::IpConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::DynamicNode(inner_node)) => {
                Box::new(inner_node)
            }
            None => panic!("No NodeT implementation listed for given node type!")
        }
    }

    pub fn as_inner_nodet<'a>(& 'a self) -> Box<& 'a dyn NodeT> {
        match &self.which_node {
            Some(WhichNode::IpAddressNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::IpPortNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::AssetNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::ProcessNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::FileNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::ProcessInboundConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::ProcessOutboundConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::NetworkConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::IpConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::DynamicNode(inner_node)) => {
                Box::new(inner_node)
            }
            None => panic!("No NodeT implementation listed for given node type!")
        }
    }

    pub fn as_mut_inner_nodet<'a>(& 'a mut self) -> Box<& 'a mut dyn NodeT> {
        match &mut self.which_node {
            Some(WhichNode::IpAddressNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::IpPortNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::AssetNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::ProcessNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::FileNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::ProcessInboundConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::ProcessOutboundConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::NetworkConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::IpConnectionNode(inner_node)) => {
                Box::new(inner_node)
            }
            Some(WhichNode::DynamicNode(inner_node)) => {
                Box::new(inner_node)
            }
            None => panic!("No NodeT implementation listed for given node type!")
        }
    }

    pub fn as_dynamic_node(&self) -> Option<&DynamicNode> {
        let which_node = match self.which_node {
            Some(ref which_node) => which_node,
            None => return None,
        };

        if let WhichNode::DynamicNode(ref dynamic_node) = which_node {
            Some(dynamic_node)
        } else {
            None
        }
    }

    pub fn into_dynamic_node(self) -> Option<DynamicNode> {
        let which_node = match self.which_node {
            Some(which_node) => which_node,
            None => return None,
        };

        if let WhichNode::DynamicNode(dynamic_node) = which_node {
            Some(dynamic_node)
        } else {
            None
        }
    }

    pub fn as_mut_dynamic_node(&mut self) -> Option<&mut DynamicNode> {
        let which_node = match self.which_node {
            Some(ref mut which_node) => which_node,
            None => {
                warn!("Failed to determine variant of node");
                return None;
            }
        };

        if let WhichNode::DynamicNode(ref mut dynamic_node) = which_node {
            Some(dynamic_node)
        } else {
            None
        }
    }

    pub fn into_json(self) -> Value {
        let which_node = match self.which_node {
            Some(which_node) => which_node,
            None => {
                panic!("Failed to determine variant of node");
            }
        };

        match which_node {
            WhichNode::AssetNode(asset_node) => asset_node.into_json(),
            WhichNode::ProcessNode(process_node) => process_node.into_json(),
            WhichNode::FileNode(file_node) => file_node.into_json(),
            WhichNode::IpAddressNode(ip_address_node) => ip_address_node.into_json(),
            WhichNode::ProcessOutboundConnectionNode(process_outbound_connection_node) => {
                process_outbound_connection_node.into_json()
            }
            WhichNode::ProcessInboundConnectionNode(process_inbound_connection_node) => {
                process_inbound_connection_node.into_json()
            }
            WhichNode::IpPortNode(ip_port_node) => ip_port_node.into_json(),
            WhichNode::NetworkConnectionNode(network_connection_node) => {
                network_connection_node.into_json()
            }
            WhichNode::IpConnectionNode(ip_connection_node) => ip_connection_node.into_json(),
            WhichNode::DynamicNode(dynamic_node) => dynamic_node.into_json(),
        }
    }
}

impl NodeT for Node {
    fn get_asset_id(&self) -> Option<&str> {
      self.as_inner_nodet().get_asset_id()
    }

    fn clone_asset_id(&self) -> Option<String> {
        self.get_asset_id().map(String::from)
    }

    fn set_asset_id(&mut self, asset_id: String) {
      self.as_mut_inner_nodet().set_asset_id(asset_id)
    }

    fn create_static_node_key(&self) -> Option<String> {
      self.as_inner_nodet().create_static_node_key()
    }

    fn get_node_key(&self) -> &str {
      self.as_inner_nodet().get_node_key()
    }

    fn set_node_key(&mut self, node_key: String) {
      self.as_mut_inner_nodet().set_node_key(node_key)
    }

    fn into_unid_session(&self) -> Result<Option<UnidSession>, Error> {
      self.as_inner_nodet().into_unid_session()
    }
}

impl MergeableNodeT for Node {
    fn merge(&mut self, other: &Self) -> bool {
        let which_node = match self.which_node {
            Some(ref mut which_node) => which_node,
            None => {
                warn!("Failed to determine variant of node");
                return false;
            }
        };

        match which_node {
            WhichNode::AssetNode(ref mut asset_node) => {
                if let Some(WhichNode::AssetNode(ref other)) = other.which_node {
                    asset_node.merge(other)
                } else {
                    warn!("Attempted to merge AssetNode with non-AssetNode ");
                    false
                }
            }
            WhichNode::ProcessNode(ref mut process_node) => {
                if let Some(WhichNode::ProcessNode(ref other)) = other.which_node {
                    process_node.merge(other)
                } else {
                    warn!("Attempted to merge ProcessNode with non-ProcessNode ");
                    false
                }
            }
            WhichNode::FileNode(ref mut file_node) => {
                if let Some(WhichNode::FileNode(ref other)) = other.which_node {
                    file_node.merge(other)
                } else {
                    warn!("Attempted to merge FileNode with non-FileNode ");
                    false
                }
            }
            WhichNode::IpAddressNode(ref mut ip_address_node) => {
                if let Some(WhichNode::IpAddressNode(ref other)) = other.which_node {
                    ip_address_node.merge(other)
                } else {
                    warn!("Attempted to merge IpAddressNode with non-IpAddressNode ");
                    false
                }
            }
            WhichNode::ProcessOutboundConnectionNode(ref mut process_outbound_connection_node) => {
                if let Some(WhichNode::ProcessOutboundConnectionNode(ref other)) = other.which_node
                {
                    process_outbound_connection_node.merge(other)
                } else {
                    warn!("Attempted to merge ProcessOutboundConnectionNode with non-ProcessOutboundConnectionNode ");
                    false
                }
            }
            WhichNode::ProcessInboundConnectionNode(ref mut process_inbound_connection_node) => {
                if let Some(WhichNode::ProcessInboundConnectionNode(ref other)) = other.which_node {
                    process_inbound_connection_node.merge(other)
                } else {
                    warn!("Attempted to merge ProcessInboundConnectionNode with non-ProcessInboundConnectionNode ");
                    false
                }
            }
            WhichNode::IpPortNode(ref mut ip_port_node) => {
                if let Some(WhichNode::IpPortNode(ref other)) = other.which_node {
                    ip_port_node.merge(other)
                } else {
                    warn!("Attempted to merge IpPortNode with non-IpPortNode ");
                    false
                }
            }
            WhichNode::NetworkConnectionNode(ref mut network_connection_node) => {
                if let Some(WhichNode::NetworkConnectionNode(ref other)) = other.which_node {
                    network_connection_node.merge(other)
                } else {
                    warn!(
                        "Attempted to merge NetworkConnectionNode with non-NetworkConnectionNode "
                    );
                    false
                }
            }
            WhichNode::IpConnectionNode(ip_connection_node) => {
                if let Some(WhichNode::IpConnectionNode(ref other)) = other.which_node {
                    ip_connection_node.merge(other)
                } else {
                    warn!("Attempted to merge IpConnectionNode with non-NetworkConnectionNode ");
                    false
                }
            }
            WhichNode::DynamicNode(ref mut dynamic_node) => {
                if let Some(WhichNode::DynamicNode(ref other)) = other.which_node {
                    dynamic_node.merge(other)
                } else {
                    warn!("Attempted to merge DynamicNode with non-DynamicNode ");
                    false
                }
            }
        }
    }

    fn merge_into(&mut self, other: Self) -> bool {
        let which_node = match self.which_node {
            Some(ref mut which_node) => which_node,
            None => {
                warn!("Failed to determine variant of node");
                return false;
            }
        };

        match which_node {
            WhichNode::AssetNode(ref mut asset_node) => {
                if let Some(WhichNode::AssetNode(other)) = other.which_node {
                    asset_node.merge_into(other)
                } else {
                    warn!("Attempted to merge AssetNode with non-AssetNode ");
                    false
                }
            }
            WhichNode::ProcessNode(ref mut process_node) => {
                if let Some(WhichNode::ProcessNode(other)) = other.which_node {
                    process_node.merge_into(other)
                } else {
                    warn!("Attempted to merge ProcessNode with non-ProcessNode ");
                    false
                }
            }
            WhichNode::FileNode(ref mut file_node) => {
                if let Some(WhichNode::FileNode(other)) = other.which_node {
                    file_node.merge_into(other)
                } else {
                    warn!("Attempted to merge FileNode with non-FileNode ");
                    false
                }
            }
            WhichNode::IpAddressNode(ref mut ip_address_node) => {
                if let Some(WhichNode::IpAddressNode(other)) = other.which_node {
                    ip_address_node.merge_into(other)
                } else {
                    warn!("Attempted to merge IpAddressNode with non-IpAddressNode ");
                    false
                }
            }
            WhichNode::ProcessOutboundConnectionNode(ref mut process_outbound_connection_node) => {
                if let Some(WhichNode::ProcessOutboundConnectionNode(other)) = other.which_node {
                    process_outbound_connection_node.merge_into(other)
                } else {
                    warn!("Attempted to merge ProcessOutboundConnectionNode with non-ProcessOutboundConnectionNode ");
                    false
                }
            }
            WhichNode::ProcessInboundConnectionNode(ref mut process_inbound_connection_node) => {
                if let Some(WhichNode::ProcessInboundConnectionNode(other)) = other.which_node {
                    process_inbound_connection_node.merge_into(other)
                } else {
                    warn!("Attempted to merge ProcessInboundConnectionNode with non-ProcessInboundConnectionNode ");
                    false
                }
            }
            WhichNode::IpPortNode(ref mut ip_port_node) => {
                if let Some(WhichNode::IpPortNode(other)) = other.which_node {
                    ip_port_node.merge_into(other)
                } else {
                    warn!("Attempted to merge IpPortNode with non-IpPortNode ");
                    false
                }
            }
            WhichNode::NetworkConnectionNode(ref mut network_connection_node) => {
                if let Some(WhichNode::NetworkConnectionNode(other)) = other.which_node {
                    network_connection_node.merge_into(other)
                } else {
                    warn!(
                        "Attempted to merge NetworkConnectionNode with non-NetworkConnectionNode "
                    );
                    false
                }
            }
            WhichNode::IpConnectionNode(ip_connection_node) => {
                if let Some(WhichNode::IpConnectionNode(other)) = other.which_node {
                    ip_connection_node.merge_into(other)
                } else {
                    warn!("Attempted to merge IpConnectionNode with non-NetworkConnectionNode ");
                    false
                }
            }
            WhichNode::DynamicNode(ref mut dynamic_node) => {
                if let Some(WhichNode::DynamicNode(other)) = other.which_node {
                    dynamic_node.merge_into(other)
                } else {
                    warn!("Attempted to merge DynamicNode with non-DynamicNode ");
                    false
                }
            }
        }
    }
}
