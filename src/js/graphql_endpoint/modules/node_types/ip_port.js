const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const ipPortArgs = () => {
    return {
        ip_address: {type: GraphQLString},
        protocol: {type: GraphQLString},
        port: {type: GraphQLInt}, 
        first_seen_timestamp: {type: GraphQLInt}, 
        last_seen_timestamp: {type: GraphQLInt}, 
    }
}

const ipPortFilters = (args) => {
    return [
        ['ip_address', args.ip_address, 'string'],
        ['protocol', args.protocol, 'string'],
        ['port', args.port, 'int'],        
        ['first_seen_timestamp', args.first_seen_timestamp, 'int'],        
        ['last_seen_timestamp', args.last_seen_timestamp, 'int'],   
    ]
}

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
    IpPort, 
    ipPortArgs,
    ipPortFilters
}