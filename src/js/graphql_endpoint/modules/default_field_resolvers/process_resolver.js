const {  
    GraphQLInt, 
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const { getDgraphClient } = require('../dgraph_client.js');
const { getEdges, getEdge, expandTo } = require('../API/queries/edge.js');

const processArgs = () => {
    return {
        process_id: {type: GraphQLInt}, 
        process_name: {type: GraphQLString},
        created_timestamp: {type: GraphQLInt},
        image_name: {type: GraphQLString},
    }
}

const processFilters = (args) => {
    return [
        ['process_id', args.process_id, 'int'],
        ['process_name', args.process_name, 'string'],
        ['created_timestamp', args.created_timestamp, 'int'],
        ['image_name', args.image_name, 'string'],
    ]
}

const defaultParentProcessResolver = (edgeName) => {
    const { ProcessType } = require('../node_types/process.js');

    return {
        type: ProcessType,
        args: processArgs(),
        resolve: async (srcNode, args) => {
            return await expandTo(getDgraphClient(), srcNode.uid, edgeName, processFilters(args), getEdge);
        }
    }
}

const defaultChildrenResolver =  (edgeName) => {
    const { ProcessType } = require('../node_types/process.js');

    return {
        type: GraphQLList(ProcessType),
        args: processArgs(), 
        resolve: async (parent, args) => {
            return await expandTo(getDgraphClient(), parent.uid, edgeName, processFilters(args), getEdges);
        }
    }
}

module.exports = {
    defaultParentProcessResolver,
    defaultChildrenResolver
}