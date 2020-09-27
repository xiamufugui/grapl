const { getEdges, getEdge, expandTo } = require('../API/queries/edge.js');
const { getDgraphClient } = require('../dgraph_client.js');
const { BaseNode } = require('./base_node.js');

const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
    GraphQLBoolean,
}  = require('graphql');

const FileType = new GraphQLObjectType({
    name : 'File',
    fields : () => {
        const { RiskType } = require('./risk.js');
        const { ProcessType, processArgs, processFilters } = require('./process.js');

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
            risks: {type: GraphQLList(RiskType)},
            file_path: {type: GraphQLString},
            creator: {
                type: ProcessType,
                args: processArgs(),
                resolve: async (srcNode, args) => { 
                    return expandTo(getDgraphClient(), srcNode.uid, 'creator', processFilters(args), getEdge)
                }
            }
        }
    }
});


module.exports = {
    FileType,
}