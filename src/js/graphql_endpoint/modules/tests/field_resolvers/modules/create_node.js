const { getDgraphClient } = require ('../../../dgraph_client');
const dgraph = require("dgraph-js");

const create_node = async (node_key, dgraph_type, properties) => {
    const dgraphClient = getDgraphClient();
    const query = `
        query {
            node as var(func: eq(node_key, "${node_key}"))
        }
    `;

    let nquads = `
        uid(node) <node_key> "${node_key}" .
        uid(node) <dgraph.type> "${dgraph_type}" .
    `;

    for (const [prop_name, prop_value] of properties) {
        nquads += `uid(node) <${prop_name}> "${prop_value}" .
        `
    }
    const mu = new dgraph.Mutation();
    mu.setSetNquads(nquads);

    const req = new dgraph.Request();
    req.setQuery(query);
    req.setMutationsList([mu]);
    req.setCommitNow(true);
    await dgraphClient.newTxn().doRequest(req);
}

module.exports = {
    create_node, 
}