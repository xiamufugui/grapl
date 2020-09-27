const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString,  
}  = require('graphql');

const { defaultIpPortsResolver } = require('../default_field_resolvers/ip_port_resolver.js');

const ProcessOutboundConnections = new GraphQLObjectType ({
    name: 'ProcessOutboundConnections',
    fields: () => {
        const { IpPort } = require('./ip_port.js');
        const { BaseNode } = require('./base_node.js');
        
        return {
            ...BaseNode,
            ip_address: {type: GraphQLString},
            protocol: {type: GraphQLString},
            created_timestamp: {type: GraphQLInt}, 
            terminated_timestamp: {type: GraphQLInt},
            last_seen_timestamp: {type: GraphQLInt},
            port: {type: GraphQLInt},
            connected_over: defaultIpPortsResolver('connected_over'),
            connected_to: defaultIpPortsResolver('connected_to'),
        }
    }
})

module.exports = {
    ProcessOutboundConnections,
}