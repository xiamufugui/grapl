const { 
    GraphQLObjectType,
    GraphQLString, 
}  = require('graphql');


module.exports.IpAddressType = new GraphQLObjectType({
    name : 'IpAddress',
    fields: () => {
        const BaseNode = require('./base_node.js').BaseNode;
        const defaultRisksResolver = require('../default_field_resolvers/risk_resolver.js').defaultRisksResolver;

        return {
            ...BaseNode,
            risks: defaultRisksResolver('risks'),
            ip_address: {type: GraphQLString}
        }
    }
});
