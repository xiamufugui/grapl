const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLNonNull
}  = require('graphql');

module.exports.QueryTookTooLongError = new GraphQLObjectType({
    name : 'QueryTookTooLong',
    fields : () => ({
        errorMessage: {type: GraphQLNonNull(GraphQLString)},
        timeout:  {type: GraphQLNonNull(GraphQLString)},
    })
})

module.exports.UnexpectedError = new GraphQLObjectType({
    name : 'UnexpectedError',
    fields : () => ({
        errorMessage: {type: GraphQLNonNull(GraphQLString)},
    })
})

