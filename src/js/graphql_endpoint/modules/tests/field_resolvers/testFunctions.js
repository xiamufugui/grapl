const fetch = require("node-fetch");
const getDgraphClient = require ('../../dgraph_client').getDgraphClient;
const dgraph = require("dgraph-js");


const createNode = async (node_key, dgraph_type, properties) => {
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
module.exports.initializeGraph = async () => {

    createNode("process_key", "Process", [
        ["process_name", "chrome.exe"],
        ["node_key", "test_process"],
        ["image_name", "image.jpg"],
        ["process_id", 1234]
        ["arguments", "args"],
    ])

    createNode("file_key", "File", [
        ["file_path", "/home/andrea/tests/file.txt"],
    ])

    createNode("lens_node_key", "Lens", [
        ["lens_name", "test_lens"]    
    ])

    createNode("lenses_node_key", "Lenses", [
        ["node_key", "test_lenses"],
        ["dgraph_type", "file"],
        ["lens_name", "test_lens"],
        ["score", 90],
        ["lens_type", "file"]
    ])
}


const fetchGraphQl = async (query) => {
    // const loginRes = await login('grapluser', 'graplpassword');

    try {
        const res = await fetch(`http://localhost:5000/graphql`,
        {
            method: 'post',
            body: JSON.stringify({ query: query }),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        .then(res => {
            // console.log(res);
            return res
        })
        .then(res => res.json())
        .then(res => {
            // console.log('retrieveGraph res', res);
            return res
        })
        .then((res) =>  res.data);
        return await res;
    } catch (e) {
        console.log("Unable to fetch GraphQL endpoint", e);
        return e; 
    }

    
}

// const testConnection = async () => {
//     let response = await fetch(
//         "http://localhost:5000/graphql",
//         {
//             credentials: 'none',
//         }
//     );

//     if(response.status === 401){
//         return true;  // checks if running but unauthorized (this is okay);
//     } else { return false }
// }


module.exports.getProcess = async (queryArgs, propertiesToFetch) => {
    let args = '';
    if (queryArgs) {
        args = `(${queryArgs})`;
    } 
    const query = `
        {
            process${args} {
                ... on Process {
                    ${propertiesToFetch}    
                }
            }    
        }
    `;
    const res = await fetchGraphQl(query)
    return res;
}

module.exports.getLens = async (queryArgs, propertiesToFetch) => {
    let args = '';
    if (queryArgs){
        args = `(${queryArgs})`;
    }

    const query = `
        {
            lens_scope${args}{
                ... on LensNode {
                    ${propertiesToFetch}
                }
            }
        }
    `
    const res = await fetchGraphQl(query);
    return res;
}

module.exports.getLenses = async (queryArgs, propertiesToFetch) => {
    let args = '';

    if (queryArgs){
        args = `(${queryArgs})`;
    }

    const query = `
        {
            lenses${args}{
                ... on Lenses { 
                    lenses{
                        ${propertiesToFetch}
                    }
                }
            }  
        }
    `
    const res = await fetchGraphQl(query);
    return res.lenses.lenses[0];
}

