const {  
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const getDgraphClient = require('../dgraph_client.js').getDgraphClient;
const getEdge = require('../API/queries/edge.js').getEdge;
const getEdges = require('../API/queries/edge.js').getEdges;
const expandTo = require('../API/queries/edge.js').expandTo;

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

module.exports.defaultAssetResolver = (edgeName) => {
    const AssetType = require('../node_types/asset.js').AssetType;
    return {
        type: AssetType,
        args: assetArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultAssetResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, assetFilters(args), getEdge);
            console.log ("expanded defaultAssetResolver", expanded);
            return expanded;
        }
    };
};

module.exports.defaultAssetsResolver = (edgeName) => {
    const AssetType = require('../node_types/asset.js').AssetType;

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


