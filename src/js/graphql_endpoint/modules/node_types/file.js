
const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
    GraphQLBoolean,
}  = require('graphql');

module.exports.FileType = new GraphQLObjectType({
    name : 'File',
    fields : () => {
        const BaseNode = require('./base_node.js').BaseNode;
        const defaultProcessResolver = require('../default_field_resolvers/process_resolver.js').defaultProcessResolver;
        const defaultRisksResolver = require('../default_field_resolvers/risk_resolver.js').defaultRisksResolver;

        return {
            ...BaseNode,
            file_name: {type: GraphQLString},
            file_type: {type: GraphQLString},
            file_extension: {type: GraphQLString},
            file_mime_type: {type: GraphQLString},
            file_size: {type: GraphQLInt},
            file_version: {type: GraphQLString}, 
            file_description: {type: GraphQLString},
            file_product: {type: GraphQLString},
            file_company: {type: GraphQLString}, 
            file_directory: {type: GraphQLString},
            file_inode: {type: GraphQLInt},
            file_hard_links: {type: GraphQLString}, 
            signed: {type: GraphQLBoolean},
            signed_status: {type: GraphQLString}, 
            md5_hash: {type: GraphQLString},
            sha1_hash: {type: GraphQLString},
            sha256_hash: {type: GraphQLString},
            risks: defaultRisksResolver('risks'),
            file_path: {type: GraphQLString},
            creator: defaultProcessResolver('creator'),
        }
    }
});

// creator: {
//     type: ProcessType,
//     args: processArgs(),
//     resolve: async (srcNode, args) => { 
//         return expandTo(getDgraphClient(), srcNode.uid, 'creator', processFilters(args), getEdge)
//     }
// }

