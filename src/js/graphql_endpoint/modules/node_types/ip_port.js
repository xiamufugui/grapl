const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const IpPort = new GraphQLObjectType({
    name: 'IpPort',
    fields: () => {
        const { NetworkConnection } = require('./network_connection.js');
        const { BaseNode } = require('./base_node.js');
        
        return {
            ...BaseNode,
            ip_address: {type: GraphQLString},
            protocol: {type: GraphQLString},
            port: {type: GraphQLInt}, 
            first_seen_timestamp: {type: GraphQLInt}, 
            last_seen_timestamp: {type: GraphQLInt}, 
            network_connections: {type: GraphQLList(NetworkConnection)},
        }
    }
})

module.exports = {
    IpPort
}