const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const ProcessInboundConnections = new GraphQLObjectType ({
    name: 'ProcessInboundConnections',
    fields: () => {
        
        const { BaseNode } = require('./base_node.js');
        const { IpPort } = require('./ip_port.js');
        const { IpAddressType } = require('./ip_address.js')

        return {
            ...BaseNode,
            ip_address: {type: GraphQLString},
            protocol: {type: GraphQLString}, 
            created_timestamp: {type: GraphQLInt}, 
            terminated_timestamp: {type: GraphQLInt},
            last_seen_timestamp: {type: GraphQLInt},
            port: {type: GraphQLInt},
            bound_port: {type: GraphQLList(IpPort)},
            bound_ip: {type: GraphQLList(IpAddressType)},
        }
    }
})

module.exports = {
    ProcessInboundConnections
}