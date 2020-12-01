module.exports.getLenses = async (dg_client, first, offset) => {
    // console.log("first offset", first, offset);
    console.log("in get lenses")
    const query = `
        query all($a: int, $b: int)
        {
            all(func: type(Lens), first: $a, offset: $b, orderdesc: score)
            {
                lens_name,
                score,
                node_key,
                uid,
                dgraph_type: dgraph.type,
                lens_type,
                scope {
                    uid,
                    node_key,
                    dgraph_type: dgraph.type,
                }
            }
        }
    `;

    const txn = dg_client.newTxn();

    try {
        const res = await txn.queryWithVars(
            query, 
            {
                '$a': first.toString(), 
                '$b': offset.toString()
            }
        );
        return res.data['all'];
    } finally {
        await txn.discard();
    }
}

// return lens
module.exports.getLensByName = async (dg_client, lensName) => {
    const query = `
        query all($a: string, $b: first, $c: offset)
            {
                all(func: eq(lens_name, $a), first: 1)
                {
                    lens_name,
                    score,
                    node_key,
                    uid,
                    dgraph_type: dgraph.type,
                    lens_type,
                    scope @filter(has(node_key)) {
                        uid,
                        dgraph_type: dgraph.type,
                        expand(_all_)
                    }
                }
            }
    `;

    const txn = dg_client.newTxn();
    
    try {
        const res = await txn.queryWithVars(query, {'$a': lensName});
        return res.data['all'][0];
    } finally {
        await txn.discard();
    }
}

module.exports.inLensScope = async (dg_client, nodeUid, lensUid) => {

    const query = `
        query all($a: string, $b: string)
        {
            all(func: uid($b)) @cascade
            {
                uid,
                scope @filter(uid($a)) {
                    uid,
                }
            }
        }`
    ;

    const txn = dg_client.newTxn();
    try {
        const res = await txn.queryWithVars(
            query, 
            { '$a': nodeUid, '$b': lensUid }
        );

        return res.data['all'].length !== 0;
        
    } finally {
        await txn.discard();
    }
}

