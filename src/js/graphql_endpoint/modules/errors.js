const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLUnionType, 
    GraphQLNonNull
}  = require('graphql');

const QueryTookTooLongError = new GraphQLObjectType({
    name : 'QueryTookTooLong',
    fields : () => ({
        errorMessage: {type: GraphQLNonNull(GraphQLString)},
        timeout:  {type: GraphQLNonNull(GraphQLString)},
    })
})

const UnexpectedError = new GraphQLObjectType({
    name : 'UnexpectedError',
    fields : () => ({
        errorMessage: {type: GraphQLNonNull(GraphQLString)},
    })
})

module.exports = { 
    QueryTookTooLongError, 
    UnexpectedError
}