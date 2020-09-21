const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList,
    GraphQLUnionType, 
    GraphQLNonNull
}  = require('graphql');

const { LensNodeType } = require('../node_types/lens_node.js');
const { ProcessType } = require('../node_types/process.js');

const { 
    UnexpectedError, 
    QueryTookTooLongError 
} = require('../errors.js');

const Lenses = new GraphQLObjectType({
    name: 'Lenses',
    fields: {
        lenses: {
            type: GraphQLNonNull(GraphQLList(GraphQLNonNull(LensNodeType)))
        }
    },
})

const LensWithErrors = new GraphQLUnionType({
    name: 'LensWithErrors',
    types: [ UnexpectedError, QueryTookTooLongError, Lenses],
    resolveType (value){
        if(value){
            return Lenses
        }
    }
});

const LensScopeWithErrors = new GraphQLUnionType({
    name: 'LensScopeWithErrors',
    types: [ UnexpectedError, QueryTookTooLongError, LensNodeType],
    resolveType (value){
        if(value){
            return LensNodeType
        }
    }
})

const resolveProcessResponseType = (node) => {
    // console.log('node', node);
    return 'Process';

}

const ProcessWithErrors = new GraphQLUnionType({
    name: 'ProcessWithErrors', 
    types: [ UnexpectedError, QueryTookTooLongError, ProcessType],
    resolveType: resolveProcessResponseType

})

module.exports = {
    LensWithErrors,
    LensScopeWithErrors,
    ProcessWithErrors
}