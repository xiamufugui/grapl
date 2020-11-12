const fetch_graphql = require('../fetch_graphql').fetch_graphql;

module.exports.get_process = async (queryArgs, propertiesToFetch) => {
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
    const res = await fetch_graphql(query);
    return res;
}

