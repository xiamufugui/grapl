


const getEdge = async (dg_client, rootUid, edgeName, predicates) => {
    // varAlloc - DGraph Variables
    const varAlloc = new VarAllocator();
    
    for (const [predicate_name, predicate_value, predicate_type] of predicates) {
        varAlloc.alloc(predicate_value, predicate_type);
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

    // filter - where clause, select

    const txn = dg_client.newTxn();

    try {
        const res = await txn.queryWithVars(query, reverseMap(varAlloc.vars));
        const root_node = res.getJson()['q'];

        if (!root_node) {
            return null
        }

        return root_node[edgeName] || null;
    } 
    finally {
        await txn.discard();
    }

}

const getEdges = async (dg_client, rootUid, edgeName, predicates) => {
    // varAlloc - DGraph Variables
    const varAlloc = new VarAllocator();
    
    for (const [predicate_name, predicate_value, predicate_type] of predicates) {
        varAlloc.alloc(predicate_value, predicate_type);
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

    // filter - where clause, select

    const txn = dg_client.newTxn();

    try {
        const res = await txn.queryWithVars(query, reverseMap(varAlloc.vars));
        const root_node = res.getJson()['q'];

        if (!root_node) {
            return []
        }

        return root_node[edgeName] || [];
    } 
    finally {
        await txn.discard();
    }

}


module.exports = {
    getEdge,
    getEdges
}