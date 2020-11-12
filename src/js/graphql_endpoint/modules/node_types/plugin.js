const { GraphQLJSONObject } = require('graphql-type-json');

const { 
    GraphQLObjectType, 
}  = require('graphql');

module.exports.PluginType = new GraphQLObjectType({
    name: 'PluginType',
    fields: () => {
        return {
            predicates: { type: GraphQLJSONObject },
        }
    }
})

