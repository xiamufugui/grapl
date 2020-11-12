const {  
    GraphQLInt, 
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const expandTo = require('../API/queries/edge.js').expandTo;
const getEdge = require('../API/queries/edge.js').getEdge;
const getEdges = require('../API/queries/edge.js').getEdges;

const getDgraphClient = require('../dgraph_client.js').getDgraphClient;

const ipConnectionsArgs = () => {
    return {
        src_ip_addr: {type: GraphQLString},
        src_port: {type: GraphQLString},
        dst_ip_addr: {type: GraphQLString},
        dst_port: {type: GraphQLString},
        created_timestamp: {type: GraphQLInt},
        terminated_timestamp: {type: GraphQLInt},
        last_seen_timestamp: {type: GraphQLInt},
    }
}

const ipConnectionsFilters = (args) => {
    return [
        ['src_ip_addr', args.src_ip_addr , 'string'],
        ['src_port', args.src_port , 'string'],
        ['dst_ip_addr', args.dst_ip_addr, 'string'],
        ['dst_port', args.dst_port , 'string'],
        ['created_timestamp', args.created_timestamp , 'int'],
        ['terminated_timestamp', args.terminated_timestamp , 'string'],
        ['last_seen_timestamp', args.last_seen_timestamp , 'string'],
    ]
}


module.exports.defaultIpConnectionResolver = (edgeName) => {
    const IpConnections = require('../node_types/ip_connections.js').IpConnections;

    return {
        type: IpConnections,
        args: ipConnectionsArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultIpConnectionResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, ipConnectionsFilters(args), getEdge);
            console.log ("expanded defaultIpConnectionResolver", expanded);
            return expanded
        }
    };
};

module.exports.defaultIpConnectionsResolver = (edgeName) => {
    const IpConnections = require('../node_types/ip_connections.js').IpConnections;

    return {
        type: GraphQLList(IpConnections),
        args: ipConnectionsArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultIpConnectionResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, ipConnectionsFilters(args), getEdges);
            console.log ("expanded defaultIpConnectionResolver", expanded);
            return expanded
        }
    };
};
