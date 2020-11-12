const { 
    GraphQLObjectType, 
    GraphQLList,
    GraphQLUnionType, 
    GraphQLNonNull
}  = require('graphql');

const LensNodeType = require('../node_types/lens_node.js').LensNodeType;
const ProcessType  = require('../node_types/process.js').ProcessType;
const UnexpectedError = require('../errors.js').UnexpectedError;
const QueryTookTooLongError = require('../errors.js').QueryTookTooLongError;

const Lenses = new GraphQLObjectType({
    name: 'Lenses',
    fields: () => {
        return {
            lenses: {
                type: GraphQLNonNull(GraphQLList(GraphQLNonNull(LensNodeType)))
            }
        }
    }
})

module.exports.LensWithErrors = new GraphQLUnionType({
    name: 'LensWithErrors',
    types: [ UnexpectedError, QueryTookTooLongError, Lenses],
    resolveType (value){
        if(value){
            return Lenses
        }
    }
});

module.exports.LensScopeWithErrors = new GraphQLUnionType({
    name: 'LensScopeWithErrors',
    types: [ UnexpectedError, QueryTookTooLongError, LensNodeType],
    resolveType (value){
        if(value){
            return LensNodeType
        }
    }
})

const resolveProcessResponseType = (node) => {
    return 'Process';
}

module.exports.ProcessWithErrors = new GraphQLUnionType({
    name: 'ProcessWithErrors', 
    types: [ UnexpectedError, QueryTookTooLongError, ProcessType],
    resolveType: resolveProcessResponseType
})
