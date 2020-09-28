const {  
    GraphQLInt, 
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const { getDgraphClient } = require('../dgraph_client.js');
const { getEdge, getEdges, expandTo } = require('../API/queries/edge.js');
const { IpConnections } = require('../node_types/ip_connections.js');

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

const ipConnectionsFilter = (args) => {
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


const defaultIpConnectionResolver = (edgeName) => {
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

const defaultIpConnectionsResolver = (edgeName) => {
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

module.exports = {
    defaultIpConnectionResolver,
    defaultIpConnectionsResolver
}