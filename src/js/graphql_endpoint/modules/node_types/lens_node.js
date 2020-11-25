const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
}  = require('graphql');

module.exports.LensNodeType = new GraphQLObjectType({
    name: "LensNode", 
    fields: () => {
        const BaseNode = require('./base_node.js').BaseNode;
        const GraplEntityType = require('./grapl_entity.js').GraplEntityType;

        return {
            ...BaseNode,
            lens_name: {type: GraphQLString}, 
            score: {type: GraphQLInt}, 
            scope: {type: GraphQLList(GraplEntityType)},
            lens_type: {type: GraphQLString}, 
        }
    }
})

// scopes: list of lens_names that a 'uid' is in_scope of
module.exports.getScopes = async (dgraphClient, rootUid, lensName) => {

    const varAlloc = new VarAllocator();
    if (lensName) {
        varAlloc.alloc('lens_name', lensName, 'string');
    }

    const varTypes = varTypeList(varAlloc);
    const filter = generateFilter(varAlloc);
    const varList = varListArray.join(", ");
    
    const query = `
        query q(${varTypes})
        {
            q(func: uid(${rootUid}))
            {
                in_scope  
                @filter(${filter}) 
                {
                    ${varList}
                }
            }
        }
    `;

    console.log('getScopes', query);
    const txn = dgraphClient.newTxn();

    try {
        const res = await txn.queryWithVars(query, reverseMap(varAlloc.vars));
        const root_node = res.data['q'];
        console.log('getScopes res', root_node);
        
        if (!root_node) {
            return []
        }

        if (!root_node[0]) {
            return []
        }

        if (!root_node[0]['in_scope']) {
            return []
        }

        return root_node[0]['in_scope']['lens_name'] || [];
    } 
    finally {
        await txn.discard();
    }
}