const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
}  = require('graphql');

const RiskType = new GraphQLObjectType({
    name: 'Risk',
    fields: () => {
        const { BaseNode } = require('./base_node.js');

        return {
            ...BaseNode,
            analyzer_name: {type: GraphQLString}, 
            risk_score: {type: GraphQLInt},
        }        
    }
})

module.exports = {
    RiskType
}




