const { 
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const expandTo = require('../API/queries/edge.js').expandTo;
const getEdge = require('../API/queries/edge.js').getEdge;
const getEdges = require('../API/queries/edge.js').getEdges;

const getDgraphClient = require('../dgraph_client.js').getDgraphClient;

const ipAddressArgs = () => {
    return {
        ip_address: {type: GraphQLString}
    }
}

module.exports.ipAddressFilters = (args) => {
    return [
        ['ip_address', args.ip_address, 'string']
    ]
}

module.exports.defaultIpAddressResolver = (edgeName) => {
    const IpAddressType = require('../node_types/ip_address.js').IpAddressType;

    return {
        type: IpAddressType,
        args: ipAddressArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultIpAddressResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, ipAddressFilters.ipAddressFilters(args), getEdge);

            console.log ("expanded defaultIpAddressResolver", expanded);
            
            return expanded;
        }
    };
};

module.exports.defaultIpAddressesResolver = (edgeName) => {
    const IpAddressType = require('../node_types/ip_address.js').IpAddressType;

    return {
        type: GraphQLList(IpAddressType),
        args: ipAddressArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultIpAddressesResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, ipAddressFilters.ipAddressFilters(args), getEdges);

            console.log ("expanded defaultIpAddressesResolver", expanded);
            
            return expanded;
        }
    };
};
