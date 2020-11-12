const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
}  = require('graphql');

module.exports.IpPort = new GraphQLObjectType({
    name: 'IpPort',
    fields: () => {
        const BaseNode = require('./base_node.js').BaseNode;
        const defaultNetworkConnectionsResolver = require('../default_field_resolvers/network_connections_resolver.js').defaultNetworkConnectionResolver;
        
        return {
            ...BaseNode,
            ip_address: {type: GraphQLString},
            protocol: {type: GraphQLString},
            port: {type: GraphQLInt}, 
            first_seen_timestamp: {type: GraphQLInt}, 
            last_seen_timestamp: {type: GraphQLInt}, 
            network_connections: defaultNetworkConnectionsResolver('network_connections'),
        }
    }
})
