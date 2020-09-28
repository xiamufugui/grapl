const { 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const { IpPort } = require('../node_types/ip_port.js');

const ipPortArgs = () => {
    return {
        ip_address: {type: GraphQLString},
        protocol: {type: GraphQLString},
        port: {type: GraphQLInt}, 
        first_seen_timestamp: {type: GraphQLInt}, 
        last_seen_timestamp: {type: GraphQLInt}, 
    }
}

const ipPortFilters = (args) => {
    return [
        ['ip_address', args.ip_address, 'string'],
        ['protocol', args.protocol, 'string'],
        ['port', args.port, 'int'],        
        ['first_seen_timestamp', args.first_seen_timestamp, 'int'],        
        ['last_seen_timestamp', args.last_seen_timestamp, 'int'],   
    ]
}

const defaultIpPortResolver = (edgeName) => {
    return {
        type: IpPort,
        args: ipPortArgs(),
        resolve: async (parent, args) => {
            console.log("expanding defaultIpPortResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, ipPortFilters(args), getEdge)
            console.log("expanded defaultIpPortResolver", expanded);
            return expanded; 
        }
    }
};

const defaultIpPortsResolver = (edgeName) => {
    return {
        type: GraphQLList(IpPort),
        args: ipPortArgs(),
        resolve: async (parent, args) => {
            console.log("expanding defaultIpPortsResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, ipPortFilters(args), getEdges)
            console.log("expanded defaultIpPortsResolver", expanded);
            return expanded; 
        }
    }
};


module.exports = {
    defaultIpPortResolver,
    defaultIpPortsResolver
}