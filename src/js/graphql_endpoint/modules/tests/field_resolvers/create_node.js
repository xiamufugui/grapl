const dgraph = require("dgraph-js");
const grpc = require("grpc");

const get_random = (list) => {
    return list[Math.floor((Math.random()*list.length))];
}

const mg_alpha = get_random(process.env.MG_ALPHAS.split(","));

const getDgraphClient = () => {
    const clientStub = new dgraph.DgraphClientStub(
        // addr: optional, default: "localhost:9080"
        mg_alpha,
        // credentials: optional, default: grpc.credentials.creaSteInsecure()
        grpc.credentials.createInsecure(),
    );

    return new dgraph.DgraphClient(clientStub);
}


const createNode = async () => {
    const dgraphClient = getDgraphClient();

    try {
        const txn = dgraphClient.newTxn({
            node_key: "testnode",
            uid: "1234567",
        });

        txn.commit();
        
        const n = getNode();
        return n; 
        } finally {
        await txn.discard();
    }
}

console.log("createNode", createNode())

// const getNode = async (a, b) => {
//     const dgraphClient = getDgraphClient();

//     const query = 
//         `query all($a: string, $b: string) {
//             all(func: eq(node_key, $a, uid, $b))
//             {
//                 node_key,
//                 uid
//             }
//         }`;
    
//     const vars = { $a: "testnode", $b: "1234567" };
//     const res = await dgraphClient.newTxn().queryWithVars(query, vars);
//     const testNodeCreated = res.getJson();
//       // Print results.
//     console.log(`Test node created: ${testNodeCreated.all.length}`);
    
//     if(testNodeCreated != {}){
//         return true;
//     } else {
//         return false; 
//     }
// }
// const n = createNode();

test('created node',
    () => {
        expect(n).toBeTruthy;
    }
)