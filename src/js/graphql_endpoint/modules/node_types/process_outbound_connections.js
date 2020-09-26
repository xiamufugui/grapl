const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const { getEdges, getEdge, expandTo } = require('../API/queries/edge.js');

const processOutboundConnectionsFilters = (args) => {
    return [
        ['ip_address', args.ip_address, 'string'],
        ['protocol', args.protocol, 'string'],
        ['created_timestamp', args.created_timestamp, 'int'],
        ['terminated_timestamp', args.terminated_timestamp, 'int'],
        ['last_seen_timestamp', args.last_seen_timestamp, 'int'],
        ['port', args.port, 'int'],

    ]
}

const processOutboundConnectionsArgs = () => {
    return{
        ip_address: {type: GraphQLString},
        protocol: {type: GraphQLString},
        created_timestamp: {type: GraphQLInt}, 
        terminated_timestamp: {type: GraphQLInt},
        last_seen_timestamp: {type: GraphQLInt},
        port: {type: GraphQLInt},
    }
}

const processOutboundConnectionsResolver = (edgeName) => {
    return {
        type: GraphQLList(ProcessOutboundConnections),
        args: processOutboundConnectionsArgs(),
        resolve: async (parent, args) => {
            console.log("expanding processOutboundConnectionsResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, processOutboundConnectionsFilters(args), getEdge)
            return expanded; 
        }
    }
}

const ProcessOutboundConnections = new GraphQLObjectType ({
    name: 'ProcessOutboundConnections',
    fields: () => {
        const { IpPort } = require('./ip_port.js');
        const { BaseNode } = require('./base_node.js');
        
        return {
            ...BaseNode,
            ip_address: {type: GraphQLString},
            protocol: {type: GraphQLString},
            created_timestamp: {type: GraphQLInt}, 
            terminated_timestamp: {type: GraphQLInt},
            last_seen_timestamp: {type: GraphQLInt},
            port: {type: GraphQLInt},
            connected_over: {type: GraphQLList(IpPort)},
            connected_to: {type: GraphQLList(IpPort)},
        }
    }
})

module.exports = {
    ProcessOutboundConnections,
    processOutboundConnectionsFilters,
    processOutboundConnectionsArgs, 
    processOutboundConnectionsResolver
}