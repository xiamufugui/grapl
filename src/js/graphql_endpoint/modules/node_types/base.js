const { 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const BaseNode = {
    uid: {type: GraphQLInt},
    node_key: {type: GraphQLString}, 
    dgraph_type: {type: GraphQLList(GraphQLString)},
}

module.exports = {
    BaseNode
}