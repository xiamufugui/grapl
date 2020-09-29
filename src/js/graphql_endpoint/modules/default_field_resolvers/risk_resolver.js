const { 
    GraphQLList, 
    GraphQLInt, 
    GraphQLString, 
}  = require('graphql');

const { getDgraphClient } = require('../dgraph_client.js');
const { getEdge, getEdges, expandTo } = require('../API/queries/edge.js');
const { RiskType } = require('../node_types/risk.js');

const riskArgs = () => {
    return {
        analyzer_name: {type: GraphQLString}, 
        risk_score: {type: GraphQLInt},      
    }
    
}

const riskFilters = (args) => {
    return [
        ['analyzer_name', args.analyzer_name, 'string'],
        ['risk_score', args.risk_score, 'int'],
    ]
}
const defaultRiskResolver = (edgeName) => {
    return {
        type: RiskType,
        args: riskArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultRiskResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, riskFilters(args), getEdge);
            console.log ("expanded defaultRiskResolver", expanded);
            return expanded
        }
    };
};

const defaultRisksResolver = (edgeName) => {
    return {
        type: GraphQLList(RiskType),
        args: riskArgs(),
        resolve: async(parent, args) => {
            console.log("expanding defaultRisksResolver");
            const expanded = await expandTo(getDgraphClient(), parent.uid, edgeName, riskFilters(args), getEdges);
            console.log ("expanded defaultRisksResolver", expanded);
            const filtered = [];
            for (const exp of expanded) {
                if (exp.node_key) {
                    filtered.push(exp);
                }
            }
            return filtered
        }
    };
};

module.exports = {
    defaultRiskResolver,
    defaultRisksResolver
}