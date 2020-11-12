const {  
    GraphQLInt, 
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const expandTo = require('../API/queries/edge.js').expandTo;
const getEdge = require('../API/queries/edge.js').getEdge;
const getEdges = require('../API/queries/edge.js').getEdges;

const getDgraphClient = require('../dgraph_client.js').getDgraphClient;

const networkConnectionArgs = () => {
    return {
        src_ip_address: {type: GraphQLString}, 
        src_port: {type: GraphQLString}, 
        dst_ip_address: {type: GraphQLString}, 
        dst_port: {type: GraphQLString}, 
        created_timestamp: {type: GraphQLInt}, 
        terminated_timestamp: {type: GraphQLInt},
        last_seen_timestamp: {type: GraphQLInt},
    }
}

const networkConnectionFilters = (args) => {
    return [
        ['src_ip_address', args.src_ip_address, 'string'],
        ['src_port', args.src_port, 'string'],
        ['dst_ip_address', args.dst_ip_address, 'string'],
        ['dst_port', args.dst_port, 'string'],
        ['created_timestamp', args.created_timestamp, 'int'],
        ['terminated_timestamp', args.terminated_timestamp , 'int'],
        ['last_seen_timestamp', args.last_seen_timestamp , 'int']
    ]
}


module.exports.defaultNetworkConnectionResolver = (edgeName) => {
    const NetworkConnection = require('../node_types/process_inbound_connections.js').NetworkConnection;

    return {
        type: NetworkConnection,
        args: networkConnectionArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultNetworkConnectionResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, networkConnectionFilters(args), getEdge);
            console.log ("expanded networkConnection", expanded);
            return expanded;
        }
    };
};

module.exports.defaultNetworkConnectionsResolver = (edgeName) => {
    const NetworkConnection = require('../node_types/network_connection.js').NetworkConnection;
    
    return {
        type: GraphQLList(NetworkConnection),
        args: networkConnectionArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultNetworkConnectionResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, networkConnectionFilters(args), getEdges);
            console.log ("expanded networkConnection", expanded);
            return expanded
        }
    };
}
