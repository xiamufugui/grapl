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
        const { defaultIpPortsResolver } = require('../default_field_resolvers/ip_port_resolver.js');
        const { defaultIpAddressResolver } = require('../default_field_resolvers/ip_address.js');

        return {
            ...BaseNode,
            ip_address: {type: GraphQLString},
            protocol: {type: GraphQLString}, 
            created_timestamp: {type: GraphQLInt}, 
            terminated_timestamp: {type: GraphQLInt},
            last_seen_timestamp: {type: GraphQLInt},
            port: {type: GraphQLInt},
            bound_port: defaultIpPortsResolver('boundPort'),
            bound_ip: defaultIpAddressResolver('bound_ip'),
        }
    }
})


module.exports = {
    ProcessInboundConnections,
}