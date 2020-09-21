const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

const LensNodeType = new GraphQLObjectType({
    name: "LensNode", 
    fields: () => {
        const { BaseNode } = require('./base_node.js');
        const { GraplEntityType } = require('./grapl_entity.js');

        return {
            ...BaseNode,
            lens_name: {type: GraphQLString}, 
            score: {type: GraphQLInt}, 
            scope: {type: GraphQLList(GraplEntityType)},
            lens_type: {type: GraphQLString}, 
        }
    }
})

module.exports = {
    LensNodeType
}