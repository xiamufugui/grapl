const { GraphQLJSONObject } = require('graphql-type-json');

const { 
    GraphQLObjectType, 
}  = require('graphql');

const PluginType = new GraphQLObjectType({
    name: 'PluginType',
    fields: {
        predicates: { type: GraphQLJSONObject },
    }
})


module.exports = {
    PluginType
}