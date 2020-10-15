const { fetch_graphql } = require('../fetch_graphql');

const get_lens = async (query_args, properties_to_fetch) => {
    let args = '';
    if (query_args){
        args = `(${query_args})`;
    }

    const query = `
        {
            lens_scope${args}{
                ... on LensNode {
                    ${properties_to_fetch}
                }
            }
        }
    `
    const res = await fetch_graphql(query);
    return res;
}

module.exports = {
    get_lens
}