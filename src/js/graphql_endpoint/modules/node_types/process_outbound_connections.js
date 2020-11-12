const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString,  
}  = require('graphql');



module.exports.ProcessOutboundConnections = new GraphQLObjectType ({
    name: 'ProcessOutboundConnections',
    fields: () => {
        const BaseNode = require('./base_node.js').BaseNode;
        const defaultIpPortsResolver = require('../default_field_resolvers/ip_port_resolver.js').defaultIpPortsResolver;
        
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
