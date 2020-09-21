const { 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
    GraphQLNonNull,
}  = require('graphql');

const BaseNode = {
    uid: {type: GraphQLNonNull(GraphQLInt)},
    node_key: {type: GraphQLNonNull(GraphQLString)}, 
    dgraph_type: {type: GraphQLNonNull(GraphQLList(GraphQLString))},
}

module.exports = {
    BaseNode
}