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
    getNeighborsFromNode,
    getRisksFromNode
}