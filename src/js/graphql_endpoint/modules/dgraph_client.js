const dgraph = require("dgraph-js");
const grpc = require("grpc");

const get_random = (list) => {
    return list[Math.floor((Math.random()*list.length))];
}

const mg_alpha = get_random(process.env.MG_ALPHAS.split(","));

module.exports.getDgraphClient = () => {
    const clientStub = new dgraph.DgraphClientStub(
        // addr: optional, default: "localhost:9080"
        mg_alpha,
        // credentials: optional, default: grpc.credentials.creaSteInsecure()
        grpc.credentials.createInsecure(),
    );

    return new dgraph.DgraphClient(clientStub);
}
