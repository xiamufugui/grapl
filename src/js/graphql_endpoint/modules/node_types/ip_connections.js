const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
}  = require('graphql');


module.exports.IpConnections = new GraphQLObjectType({
    name: 'IpConnections',
    fields: () => {
        const IpAddressType = require('./ip-address.js').IpAddressType;
        const defaultRisksResolver = require('../default_field_resolvers/risk_resolver.js').defaultRisksResolver;

        return {
            ...BaseNode,
            risks: defaultRisksResolver('risks'),
            src_ip_addr: {type: GraphQLString},
            src_port: {type: GraphQLString},
            dst_ip_addr: {type: GraphQLString},
            dst_port: {type: GraphQLString},
            created_timestamp: {type: GraphQLInt},
            terminated_timestamp: {type: GraphQLInt},
            last_seen_timestamp: {type: GraphQLInt},
            inbound_ip_connection_to: {type: IpAddressType},
        }
    }
})

