const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const { getDgraphClient } = require('../dgraph_client.js');
const { getEdge, getEdges, expandTo } = require('../API/queries/edge.js');


const ProcessInboundConnections = new GraphQLObjectType ({
    name: 'ProcessInboundConnections',
    fields: () => {

        const { BaseNode } = require('./base_node.js');
        const { IpAddressType, ipAddressFilters, ipAddressArgs } = require('./ip_address.js');
        const { defaultIpPortsResolver } = require('../default_field_resolvers/ip_port_resolver.js');

        return {
            ...BaseNode,
            ip_address: {type: GraphQLString},
            protocol: {type: GraphQLString}, 
            created_timestamp: {type: GraphQLInt}, 
            terminated_timestamp: {type: GraphQLInt},
            last_seen_timestamp: {type: GraphQLInt},
            port: {type: GraphQLInt},
            bound_port: defaultIpPortsResolver('boundPort'),
            bound_ip: {
                type: GraphQLList(IpAddressType),
                args: ipAddressArgs(), 
                resolve: async (parent, args) => {
                    return await expandTo(getDgraphClient(), parent.uid, 'bound_ip', ipAddressFilters(args), getEdges)
                }
            },
        }
    }
})


module.exports = {
    ProcessInboundConnections,
}