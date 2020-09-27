const { 
    GraphQLObjectType,
    GraphQLString, 
    GraphQLList
}  = require('graphql');

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
}