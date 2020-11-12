const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
}  = require('graphql');

const defaultNetworkConnectionsResolver = require('../default_field_resolvers/network_connections_resolver.js');


module.exports.IpPort = new GraphQLObjectType({
    name: 'IpPort',
    fields: () => {
        const BaseNode = require('./base_node.js').BaseNode;
        
        
        return {
            ...BaseNode,
            ip_address: {type: GraphQLString},
            protocol: {type: GraphQLString},
            port: {type: GraphQLInt}, 
            first_seen_timestamp: {type: GraphQLInt}, 
            last_seen_timestamp: {type: GraphQLInt}, 
            network_connections: defaultNetworkConnectionsResolver.defaultNetworkConnectionsResolver('network_connections'),
        }
    }
})
