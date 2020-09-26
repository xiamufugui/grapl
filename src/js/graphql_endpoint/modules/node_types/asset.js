const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLList
}  = require('graphql');

const AssetType = new GraphQLObjectType(
    {
        name: 'Asset',
        fields: () => {
            const { ProcessType } = require('./process.js'); 
            const { RiskType } = require('./risk.js');
            const { FileType } = require('./file.js');
            const { IpAddressType } = require('./ip_address.js');
            const { BaseNode } = require('./base_node.js');

            return {
                ...BaseNode,
                risks: { type: GraphQLList(RiskType) },
                hostname: { type: GraphQLString },
                asset_ip: { type: GraphQLList(IpAddressType) },
                asset_processes: { type: GraphQLList(ProcessType) }, 
                files_on_asset: { type: GraphQLList(FileType) },
            }
        }
    }
);

module.exports = {
    AssetType
}