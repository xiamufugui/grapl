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
    types: [ 
        GraphQLNonNull(UnexpectedError), 
        GraphQLNonNull(QueryTookTooLongError),  
        GraphQLNonNull(GraphQLList(GraphQLNonNull(LensNodeType))),
    ],
});

const _LensScope = new GraphQLUnionType({
    name: '_LensScope',
    types: [ 
        GraphQLNonNull(UnexpectedError),
        GraphQLNonNull(QueryTookTooLongError),
        GraphQLNonNull(LensNodeType),
    ]
})

const _Process = new GraphQLUnionType({
    name: '_Process', 
    types: [ 
        GraphQLNonNull(UnexpectedError),
        GraphQLNonNull(QueryTookTooLongError),
        GraphQLNonNull(GraphQLList(GraphQLNonNull(ProcessType))),
    ]
})

module.exports = {
    _Lens,
    _LensScope,
    _Process
}