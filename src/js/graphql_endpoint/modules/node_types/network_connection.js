const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const NetworkConnection = new GraphQLObjectType({
    name: 'NetworkConnection',
    fields: () => {
        const { IpPort } = require('./ip_port.js');
        const { getEdges, getEdge, expandTo } = require('../API/queries/edge.js');
        const {ipPortFilters, ipPortArgs} = require('./ip_port.js');
        
        return{
            src_ip_address: {type: GraphQLString}, 
            src_port: {type: GraphQLString}, 
            dst_ip_address: {type: GraphQLString}, 
            dst_port: {type: GraphQLString}, 
            created_timestamp: {type: GraphQLInt}, 
            terminated_timestamp: {type: GraphQLInt},
            last_seen_timestamp: {type: GraphQLInt},
            inbound_network_connection_to: {
                type: GraphQLList(IpPort),
                args: ipPortArgs(),
                resolve: async(parent, args) => {
                    return await expandTo(getDGraphClient(), parent.uid, 'inbound_networkConnection', ipPortFilters(args), getEdges);
                }
            },    
        }
    }
}) 

module.exports = {
    NetworkConnection
}