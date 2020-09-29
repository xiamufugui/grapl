const { 
    GraphQLObjectType,
    GraphQLString, 
}  = require('graphql');

const { defaultRisksResolver } = require('../default_field_resolvers/risk_resolver.js');

const IpAddressType = new GraphQLObjectType({
    name : 'IpAddress',
    fields: () => {
        const { BaseNode } = require('./base_node.js');

        return {
            ...BaseNode,
            risks: defaultRisksResolver('risks'),
            ip_address: {type: GraphQLString}
        }
    }
});

module.exports = {
    IpAddressType,
}