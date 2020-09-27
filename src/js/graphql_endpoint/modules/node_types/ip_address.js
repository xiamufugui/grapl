const { 
    GraphQLObjectType,
    GraphQLString, 
    GraphQLList
}  = require('graphql');

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

const IpAddressType = new GraphQLObjectType({
    name : 'IpAddress',
    fields: () => {
        const { BaseNode } = require('./base_node.js');
        const { RiskType } = require('./risk.js');

        return {
            ...BaseNode,
            risks: {type: GraphQLList(RiskType)},
            ip_address: {type: GraphQLString}
        }
    }
});

module.exports = {
    IpAddressType,
    ipAddressArgs,
    ipAddressFilters,
}