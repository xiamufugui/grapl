const fetch = require("node-fetch");

const testConnection = async () => {
    let response = await fetch("http://localhost:5000/graphql");

    if(response.status === 401){
        return  // running but unauthorized (this is okay)
    } else { return false }
}

testConnection();

module.exports = {
    testConnection
}