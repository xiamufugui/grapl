const {VarAllocator, varTypeList, reverseMap, generateFilter} = require('../../var_allocator.js')

const getEdge = async (dg_client, rootUid, edgeName, predicates) => {
    // varAlloc - DGraph Variables
    const varAlloc = new VarAllocator();
    
    for (const [predicate_name, predicate_value, predicate_type] of predicates) {
        varAlloc.alloc(predicate_name, predicate_value, predicate_type);
    }
    const varTypes = varTypeList(varAlloc);
    const filter = generateFilter(varAlloc);
    const varListArray = [];
    
    for (const [predicate_name, predicate_value, predicate_type] of predicates) {
        varListArray.push(predicate_name);
    }
    
    if (varListArray.indexOf('uid') === -1) {
        varListArray.push('uid');
    }
    
    if (varListArray.indexOf('node_key') === -1) {
        varListArray.push('node_key');
    }
    
    const varList = varListArray.join(", ");
    
    const query = `
        query q(${varTypes})
        {
            q(func: uid(${rootUid}))
            {
                ${edgeName}  
                @filter( ${filter}) 
                {
                    dgraph_type: dgraph.type
                    ${varList}
                }
            }
        }
    `;

    // @filter - where clause, select
    console.log('getEdge', query);
    const txn = dg_client.newTxn();

    try {
        const res = await txn.queryWithVars(query, reverseMap(varAlloc.vars));
        const root_node = res.getJson()['q'];
        console.log('getEdge res', root_node);
        
        if (!root_node) {
            return []
        }

        if (!root_node[0]) {
            return []
        }

        return root_node[0][edgeName] || [];
    } 
    finally {
        await txn.discard();
    }

}

const getEdges = async (dg_client, rootUid, edgeName, predicates) => {
    // varAlloc - DGraph Variables
    const varAlloc = new VarAllocator();
    
    for (const [predicate_name, predicate_value, predicate_type] of predicates) {
        varAlloc.alloc(predicate_name, predicate_value, predicate_type);
    }
    const varTypes = varTypeList(varAlloc);
    const filter = generateFilter(varAlloc);
    const varListArray = [];
    
    for (const [predicate_name, predicate_value, predicate_type] of predicates) {
        varListArray.push(predicate_name);
    }
    
    if (varListArray.indexOf('uid') === -1) {
        varListArray.push('uid');
    }
    
    if (varListArray.indexOf('node_key') === -1) {
        varListArray.push('node_key');
    }
    
    const varList = varListArray.join(", ");
    
    const query = `
        query q(${varTypes})
        {
            q(func: uid(${rootUid}))
            {
                ${edgeName}  
                @filter( ${filter}) 
                {
                    dgraph_type: dgraph.type
                    ${varList}
                }
            }
        }
    `;

    console.log('getEdges query, ', query);

    const txn = dg_client.newTxn();

    try {
        const res = await txn.queryWithVars(query, reverseMap(varAlloc.vars));
        const root_node = res.getJson()['q'];
        
        if (!root_node) {
            return []
        }

        if (!root_node[0]) {
            return []
        }

        return root_node[0][edgeName] || [];
    } 
    finally {
        await txn.discard();
    }

}

const expandTo = async (dgraphClient, parentUid, edgeName, filters, expandFn) => {
    try{
        console.log('fetching edge', edgeName, ' of: ', parentUid, ' with ', filters);
        const edge = await expandFn(
            dgraphClient,
            parentUid,
            edgeName,
            filters,
        )
        console.log('Found edge', edgeName, ' of: ', parentUid, edgeName);
        return edge; 
        
    } catch (e) {
        console.log("e", e)
        return 0; 
    }
}



module.exports = {
    getEdge,
    getEdges,
    expandTo,
}