const { 
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const { getDgraphClient } = require('../dgraph_client.js');
const { getEdge, getEdges, expandTo } = require('../API/queries/edge.js');
const { IpAddressType } = require('../node_types/ip_address.js');


const ipAddressArgs = () => {
    return {
        ip_address: {type: GraphQLString}
    }
}

const ipAddressFilters = (args) => {
    return [
        ['ip_address', args.ip_address, 'string']
    ]
}

const defaultIpAddressResolver = (edgeName) => {
    return {
        type: IpAddressType,
        args: ipAddressArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultIpAddressResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, ipAddressFilters(args), getEdge);

            console.log ("expanded defaultIpAddressResolver", expanded);
            
            return expanded
        }
    };
};

const defaultIpAddressesResolver = (edgeName) => {
    return {
        type: GraphQLList(IpAddressType),
        args: ipAddressArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultIpAddressesResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, ipAddressFilters(args), getEdges);

            console.log ("expanded defaultIpAddressesResolver", expanded);
            
            return expanded
        }
    };
};


module.exports = {
    defaultIpAddressResolver,
    defaultIpAddressesResolver,
}