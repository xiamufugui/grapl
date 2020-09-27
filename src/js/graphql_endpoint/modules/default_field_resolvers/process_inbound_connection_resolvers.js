const {  
    GraphQLInt, 
    GraphQLString, 
}  = require('graphql');

const { getDgraphClient } = require('../dgraph_client.js');
const { getEdge, getEdges, expandTo } = require('../API/queries/edge.js');


const processInboundConnectionArgs = () => { 
    return {
        ip_address: {type: GraphQLString},
        protocol: {type: GraphQLString},
        created_timestamp: {type: GraphQLInt}, 
        terminated_timestamp: {type: GraphQLInt},
        last_seen_timestamp: {type: GraphQLInt},
        port: {type: GraphQLInt},
    }
}

const processInboundConnectionFilters = (args) => {
    return [
        ['ip_address', args.ip_address, 'string'],
        ['protocol', args.protocol, 'string'],
        ['created_timestamp', args.created_timestamp, 'int'],
        ['terminated_timestamp', args.terminated_timestamp, 'int'],
        ['last_seen_timestamp', args.last_seen_timestamp, 'int'],
        ['port', args.port, 'int'],

    ]
} 

const defaultProcessInboundConnectionResolver = (edgeName) => {
    return {
        type: ProcessInboundConnections,
        args: processInboundConnectionArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultProcessInboundConnectionResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, processInboundConnectionFilters(args), getEdge);
            console.log ("expanded processInboundConnection", expanded);
            return expanded
        }
    }
};

const defaultProcessInboundConnectionsResolver = (edgeName) => {
    return {
        type: ProcessInboundConnections,
        args: processInboundConnectionArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultProcessInboundConnectionResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, processInboundConnectionFilters(args), getEdges);
            console.log ("expanded processInboundConnection", expanded);
            return expanded
        }
    }
}

module.exports = {
    defaultProcessInboundConnectionResolver,
    defaultProcessInboundConnectionsResolver
}