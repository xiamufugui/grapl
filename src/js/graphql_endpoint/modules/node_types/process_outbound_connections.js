const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

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
            connected_over: {type: GraphQLList(IpPort)},
            connected_to: {type: GraphQLList(IpPort)},
        }
    }
})

module.exports = {
    ProcessOutboundConnections
}