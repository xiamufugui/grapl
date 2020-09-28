const { 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const { getDgraphClient } = require('../dgraph_client.js');
const { getEdge, getEdges, expandTo } = require('../API/queries/edge.js');
const { LensNode } = require('../node_types/lens_node.js');

const lensNodeArgs = () => {
    return {
        lens_name: {type: GraphQLString}, 
        score: {type: GraphQLInt}, 
        lens_type: {type: GraphQLString}, 
    }
}

const lensNodeFilters = (args) => {
    return [
        ['lens_name', args.lens_name, 'string'],
        ['score', args.score, 'int'],
        ['lens_type', args.lens_type, 'string']
    ]
}

const defaultLensNodeResolver = (edgeName) => {
    return {
        type: LensNode,
        args: lensNodeArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultLensNodeResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, lensNodeFilters(args), getEdge);
            console.log ("expanded defaultLensNodeResolver", expanded);
            return expanded;
        }
    
    }
};


const defaultLensNodesResolver = (edgeName) => {
    return {
        type: GraphQLList(LensNode),
        args: lensNodeArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultLensNodesResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, lensNodeFilters(args), getEdges);
            console.log ("expanded defaultLensNodesResolver", expanded);
            return expanded;
        }
    
    }
};


module.exports = {
    defaultLensNodeResolver,
    defaultLensNodesResolver
}