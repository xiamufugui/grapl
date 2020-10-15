const fetch = require("node-fetch");

const fetch_graphql = async (query) => {
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
            return res
        })
        .then(res => res.json())
        .then(res => {
            return res
        })
        .then((res) =>  res.data);
        return await res;
    } catch (e) {
        console.log("Unable to fetch GraphQL endpoint", e);
        return e; 
    }    
}

module.exports = { 
    fetch_graphql
}