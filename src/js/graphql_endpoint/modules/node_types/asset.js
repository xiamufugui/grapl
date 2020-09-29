const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLList
}  = require('graphql');


const AssetType = new GraphQLObjectType(
    {
        name: 'Asset',
        fields: () => {
            const { BaseNode } = require('./base_node.js');
            const { defaultRisksResolver } = require('../default_field_resolvers/risk_resolver.js');
            const { defaultIpAddressesResolver } = require('../default_field_resolvers/ip_address_resolver.js');
            const { defaultFilesResolver } = require('../default_field_resolvers/file_resolver.js');
            const { defaultProcessesResolver } = require('../default_field_resolvers/process_resolver.js');

            return {
                ...BaseNode,
                risks: defaultRisksResolver('risks'),
                hostname: { type: GraphQLString },
                asset_ip: defaultIpAddressesResolver('asset_ip'),
                asset_processes: defaultProcessesResolver('asset_processes'), 
                files_on_asset: defaultFilesResolver('files_on_asset'),
            }
        }
    }
);

module.exports = {
    AssetType
}