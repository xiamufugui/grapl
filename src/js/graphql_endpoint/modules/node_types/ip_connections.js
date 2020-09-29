const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const { defaultRisksResolver } = require('../default_field_resolvers/risk_resolver.js');

const IpConnections = new GraphQLObjectType({
    name: 'IpConnections',
    fields: () => {
        const { IpAddressType } = require('./ip-address.js');

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

module.exports = {
    IpConnections
}