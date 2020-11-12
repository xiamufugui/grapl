const {  
    GraphQLInt, 
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const expandTo = require('../API/queries/edge.js').expandTo;
const getEdge = require('../API/queries/edge.js').getEdge;
const getEdges = require('../API/queries/edge.js').getEdges;

const getDgraphClient = require('../dgraph_client.js').getDgraphClient;

const processInboundConnectionArgs = () => { 
    return {
        ip_address: {type: GraphQLString},
        protocol: {type: GraphQLString},
        created_timestamp: {type: GraphQLInt}, 
        terminated_timestamp: {type: GraphQLInt},
        last_seen_timestamp: {type: GraphQLInt},
        port: {type: GraphQLInt},
    };
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

module.exports.defaultProcessInboundConnectionResolver = (edgeName) => {
    const ProcessInboundConnections = require('../node_types/process_inbound_connections.js').ProcessInboundConnections

    return {
        type: ProcessInboundConnections,
        args: processInboundConnectionArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultProcessInboundConnectionResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, processInboundConnectionFilters(args), getEdge);
            console.log ("expanded processInboundConnection", expanded);
            return expanded;
        }
    };
};

module.exports.defaultProcessInboundConnectionsResolver = (edgeName) => {
    const ProcessInboundConnections = require('../node_types/process_inbound_connections.js').ProcessInboundConnections

    return {
        type: GraphQLList(ProcessInboundConnections),
        args: processInboundConnectionArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultProcessInboundConnectionResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, processInboundConnectionFilters(args), getEdges);
            console.log ("expanded processInboundConnection", expanded);
            return expanded
        }
    };
}
