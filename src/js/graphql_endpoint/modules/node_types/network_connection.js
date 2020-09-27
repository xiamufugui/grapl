const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');


const NetworkConnection = new GraphQLObjectType({
    name: 'NetworkConnection',
    fields: () => {
        const { defaultIpPortResolver } = require('../default_field_resolvers/ip_port_resolver.js');

        return{
            src_ip_address: {type: GraphQLString}, 
            src_port: {type: GraphQLString}, 
            dst_ip_address: {type: GraphQLString}, 
            dst_port: {type: GraphQLString}, 
            created_timestamp: {type: GraphQLInt}, 
            terminated_timestamp: {type: GraphQLInt},
            last_seen_timestamp: {type: GraphQLInt},
            inbound_network_connection_to: defaultIpPortResolver('inbound_network_connection')
        }
    }
}) 

module.exports = {
    NetworkConnection
}