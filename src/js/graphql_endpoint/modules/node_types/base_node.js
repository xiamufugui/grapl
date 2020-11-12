const { 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
    GraphQLNonNull,
}  = require('graphql');

module.exports.BaseNode = {
    uid: {type: GraphQLNonNull(GraphQLInt)},
    node_key: {type: GraphQLNonNull(GraphQLString)}, 
    dgraph_type: {type: GraphQLNonNull(GraphQLList(GraphQLString))},
}
