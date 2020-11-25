// const dgraph = require("dgraph-js");
// const grpc = require("grpc");
const dgraph = require("dgraph-js-http");

const get_random = (list) => {
    return list[Math.floor((Math.random()*list.length))];
}

const mg_alpha = get_random(process.env.MG_ALPHAS.split(","));

// module.exports.getDgraphClient = () => {
//     const clientStub = new dgraph.DgraphClientStub(
//         // addr: optional, default: "localhost:9080"
//         mg_alpha,
//         // credentials: optional, default: grpc.credentials.creaSteInsecure()
//         grpc.credentials.createInsecure(),
//     );

//     return new dgraph.DgraphClient(clientStub);
// }
let client = null;

module.exports.getDgraphClient = (init_client=false) => {
    if (init_client || !client) {
        const clientStub = new dgraph.DgraphClientStub(
                 // addr: optional, default: "http://localhost:9080"
                // mg_alpha,
                "http://localhost:8080",
                // legacyApi: optional, default: false. Set to true when connecting to Dgraph v1.0.x
                false,
        );

        client = new dgraph.DgraphClient(clientStub)
    }

    return client;
}