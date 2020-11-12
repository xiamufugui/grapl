const { 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');


const expandTo = require('../API/queries/edge.js').expandTo;
const getEdges = require('../API/queries/edge.js').getEdges;

const getDgraphClient = require('../dgraph_client.js').getDgraphClient;

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

module.exports.defaultProcessOutboundConnectionsResolver = (edgeName) => {
    const ProcessOutboundConnections = require('../node_types/process_outbound_connections.js').ProcessOutboundConnections;

    return {
        type: GraphQLList(ProcessOutboundConnections),
        args: processOutboundConnectionsArgs(),
        resolve: async (parent, args) => {
            console.log("expanding processOutboundConnectionsResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, processOutboundConnectionsFilters(args), getEdges)
            return expanded; 
        }
    }
}

module.exports.defaultProcessOutboundConnectionResolver = (edgeName) => {
    return {
        type: ProcessOutboundConnections,
        args: processOutboundConnectionsArgs(),
        resolve: async (parent, args) => {
            console.log("expanding processOutboundConnectionResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, processOutboundConnectionsFilters(args), getEdge)
            return expanded; 
        }
    }
}
