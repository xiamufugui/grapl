const {  
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const { getDgraphClient } = require('../dgraph_client.js');
const { getEdge, getEdges, expandTo } = require('../API/queries/edge.js');
const { AssetType } = require('../node_types/asset.js');

const assetArgs = () => {
    return {
        hostName: {type: GraphQLString}
    };
};

const assetFilters = (args) => {
    return [
        ['hostName', args.hostName, 'string']
    ]
};

const defaultAssetResolver = (edgeName) => {
    return {
        type: AssetType,
        args: assetArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultAssetResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, assetFilters(args), getEdge);
            console.log ("expanded defaultAssetResolver", expanded);
            return expanded
        }
    };
};

const defaultAssetsResolver = (edgeName) => {
    return {
        type: GraphQLList(AssetType),
        args: assetArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultAssetsResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, assetFilters(args), getEdges);
            console.log ("expanded defaultAssetsResolver", expanded);
            return expanded
        }
    };
};


module.exports = {
    defaultAssetsResolver,
    defaultAssetResolver,
}