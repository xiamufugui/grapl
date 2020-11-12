const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
}  = require('graphql');

module.exports.RiskType = new GraphQLObjectType({
    name: 'Risk',
    fields: () => {
        const BaseNode = require('./base_node.js').BaseNode;

        return {
            ...BaseNode,
            analyzer_name: {type: GraphQLString}, 
            risk_score: {type: GraphQLInt},
        }        
    }
})





