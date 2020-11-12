const { 
    GraphQLList, 
    GraphQLInt, 
    GraphQLString, 
}  = require('graphql');

const expandTo = require('../API/queries/edge.js').expandTo;
const getEdge = require('../API/queries/edge.js').getEdge;
const getEdges = require('../API/queries/edge.js').getEdges;

const getDgraphClient = require('../dgraph_client.js').getDgraphClient;

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
module.exports.defaultRiskResolver = (edgeName) => {
    const RiskType = require('../node_types/risk.js').RiskType;

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

module.exports.defaultRisksResolver = (edgeName) => {
    const RiskType = require('../node_types/risk.js').RiskType;

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
