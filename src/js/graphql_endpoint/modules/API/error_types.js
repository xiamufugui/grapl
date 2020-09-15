const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList,
    GraphQLUnionType, 
    GraphQLNonNull
}  = require('graphql');

const {
    LensNodeType, 
    ProcessType
} = require('./types.js');

const { 
    UnexpectedError, 
    QueryTookTooLongError 
} = require('../errors.js');

const _Lens = new GraphQLUnionType({
    name: '_Lens',
    types: [ UnexpectedError, QueryTookTooLongError, LensNodeType],
    resolveType (value){
        if(value){
            return LensNodeType
        }
    }
});

const _LensScope = new GraphQLUnionType({
    name: '_LensScope',
    types: [ UnexpectedError, QueryTookTooLongError, LensNodeType],
    resolveType (value){
        if(value){
            return LensNodeType
        }
    }
})

const resolveProcessResponseType = (node) => {
    console.log('node', node)
    return 'Process';

}

const _Process = new GraphQLUnionType({
    name: '_Process', 
    types: [ UnexpectedError, QueryTookTooLongError, ProcessType
        // GraphQLNonNull(UnexpectedError),
        // GraphQLNonNull(QueryTookTooLongError),
        // GraphQLNonNull(GraphQLList(GraphQLNonNull(ProcessType))),
    ],
    resolveType: resolveProcessResponseType

})

module.exports = {
    _Lens,
    _LensScope,
    _Process
}