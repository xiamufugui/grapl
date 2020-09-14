const  {
    VarAllocator,
    generateFilter,
    varTypeList,
    reverseMap
} = require('../../var_allocator');


const getProcess = async (dg_client, filters) => {
    console.log("DGClient", dg_client)
    console.log("Filters", filters)

    const varAlloc = new VarAllocator();
    varAlloc.alloc(filters.pid, 'int');
    varAlloc.alloc(filters.processName, 'string');

    const varTypes = varTypeList(varAlloc);
    const filter = generateFilter(varAlloc);
    const varListArray = Array.from(varAlloc.vars.keys());
    if (varListArray.indexOf('uid') === -1) {
        varListArray.push('uid');
    }
    if (varListArray.indexOf('node_key') === -1) {
        varListArray.push('node_key');
    }
    const varList = varListArray.join(", ");
    const query = `
    query process(${varTypes})
    {
        process(func: type(Process))

        @filter(
            ${filter}
        )

        {
            ${varList}
        }
    }`;

    const txn = dg_client.newTxn();

    try {
        const res = await txn.queryWithVars(query, reverseMap(varAlloc.vars));
        return res.getJson()['process'];
    } finally {
        await txn.discard();
    }
};

module.exports = { getProcess };