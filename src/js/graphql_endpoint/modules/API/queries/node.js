const {VarAllocator, varTypeList, reverseMap, generateFilter} = require('../../var_allocator.js')
// function to build field resolver 
// predicates - property filters to apply to target node 

const getNode = async (dg_client, typeName, predicates) => {
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
            q(func: type(${typeName}), first: 1)
            @filter( ${filter}) 
            {
                dgraph_type: dgraph.type
                ${varList}
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

        return root_node[0] || null;
    } 
    finally {
        await txn.discard();
    }

}

const getNeighborsFromNode = async (dg_client, nodeUid) => {
    const query = `
    query all($a: string)
    {
        all(func: uid($a), first: 1)
        {
            uid,
            dgraph_type
            expand(_all_) {
                uid,
                dgraph_type: dgraph.type,
                expand(_all_)
            }
        }
    }`;
    const txn = dg_client.newTxn();
    try {
        const res = await txn.queryWithVars(query, {'$a': nodeUid});
        return res.getJson()['all'][0];
    } finally {
        await txn.discard();
    }
}

const getRisksFromNode = async (dg_client, nodeUid) => {
    if (!nodeUid) {
        console.warn('nodeUid can not be null, undefined, or empty')
        return
    }
    const query = `
    query all($a: string)
    {
        all(func: uid($a)) @cascade
        {
            uid,
            dgraph_type: dgraph.type
            node_key
            risks {
                uid
                dgraph_type: dgraph.type
                node_key
                analyzer_name
                risk_score
            }
        }
    }`;
    const txn = dg_client.newTxn();
    try {
        const res = await txn.queryWithVars(query, {'$a': nodeUid});
        return res.getJson()['all'][0]['risks'];
    } finally {
        await txn.discard();
    }
}



module.exports = {
    getNode,
    getNeighborsFromNode,
    getRisksFromNode
}