const {  
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const { expandTo, getEdge, getEdges } = require('../API/queries/edge.js');

const { getDgraphClient } = require('../dgraph_client.js');
const { FileType } = require('../node_types/file.js');

const fileFilters = (args) => {
    return [
        ['file_name', args.file_name, 'string'],
        ['file_type', args.file_type, 'string'],
        ['file_extension', args.file_extension, 'string'],
        ['file_mime_type', args.file_mime_type, 'string'],
        ['file_size', args.file_size, 'int'],
        ['file_version', args.file_version, 'string'],
        ['file_description', args.file_description, 'string'],
        ['file_product', args.file_product, 'string'],
        ['file_company', args.file_company, 'string'],
        ['file_directory', args.file_directory, 'string'],
        ['file_inode', args.file_inode, 'int'],
        ['file_hard_links', args.file_hard_links, 'string'],
        ['signed_status', args.signed_status, 'string'],
        ['md5_hash', args.md5_hash, 'string'],
        ['sha1_hash', args.sha1_hash, 'string'],
        ['sha256_hash', args.sha256_hash, 'string'],
        ['file_path', args.file_path, 'string'],
    ]
}

const fileArgs = () => {
    return {
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
        signed_status: {type: GraphQLString}, 
        md5_hash: {type: GraphQLString},
        sha1_hash: {type: GraphQLString},
        sha256_hash: {type: GraphQLString},
        file_path: {type: GraphQLString},
    }
}


const defaultFileResolver = (edgeName) => {
    return {
        type: FileType,
        args: fileArgs(),
        resolve: async (parent, args) => {
            console.log("expanding defaultFileResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, fileFilters(args), getEdge);
            console.log("expanded defaultFileResolver", expanded)
            return expanded
        }
    }
} 


const defaultFilesResolver = (edgeName) => {
    return {
        type: GraphQLList(FileType),
        args: fileArgs(),
        resolve: async (parent, args) => {
            console.log("expanding defaultFilesResolver");

            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, fileFilters(args), getEdges);
            console.log(expanded)
            return expanded
        }
    }
} 

module.exports = {
    defaultFileResolver,
    defaultFilesResolver,
}