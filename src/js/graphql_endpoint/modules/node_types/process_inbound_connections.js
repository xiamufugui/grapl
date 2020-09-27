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
        const { IpPort, ipPortArgs, ipPortFilters } = require('./ip_port.js');
        const { IpAddressType, ipAddressFilters, ipAddressArgs } = require('./ip_address.js');
        const { getEdges, expandTo } = require('../API/queries/edge.js');

        return {
            ...BaseNode,
            ip_address: {type: GraphQLString},
            protocol: {type: GraphQLString}, 
            created_timestamp: {type: GraphQLInt}, 
            terminated_timestamp: {type: GraphQLInt},
            last_seen_timestamp: {type: GraphQLInt},
            port: {type: GraphQLInt},
            bound_port: {
                type: GraphQLList(IpPort),
                args: ipPortArgs(),
                resolve: async(parent, args) => {
                    return await expandTo(getDGraphClient(), parent.uid, 'bound_port', ipPortFilters(args), getEdges);
                }
            },
            bound_ip: {
                type: GraphQLList(IpAddressType),
                args: ipAddressArgs(), 
                resolve: async (parent, args) => {
                    return await expandTo(getDGraphClient(), parent.uid, 'bound_ip', ipAddressFilters(args), getEdges)
                }
            },
        }
    }
})

module.exports = {
    ProcessInboundConnections
}