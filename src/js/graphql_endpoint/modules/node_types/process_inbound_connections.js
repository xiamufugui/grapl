const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
}  = require('graphql');

module.exports.ProcessInboundConnections = new GraphQLObjectType ({
    name: 'ProcessInboundConnections',
    fields: () => {

        const BaseNode = require('./base_node.js').BaseNode;
        const defaultIpPortsResolver = require('../default_field_resolvers/ip_port_resolver.js').defaultIpPortsResolver;
        const defaultIpAddressResolver = require('../default_field_resolvers/ip_address_resolver.js').defaultIpAddressResolver;

        return {
            ...BaseNode,
            ip_address: {type: GraphQLString},
            protocol: {type: GraphQLString}, 
            created_timestamp: {type: GraphQLInt}, 
            terminated_timestamp: {type: GraphQLInt},
            last_seen_timestamp: {type: GraphQLInt},
            port: {type: GraphQLInt},
            bound_port: defaultIpPortsResolver('bound_port'),
            bound_ip: defaultIpAddressResolver('bound_ip'),
        }
    }
})


