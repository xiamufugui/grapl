const fetch_graphql = require("../fetch_graphql").fetch_graphql;

module.exports.get_lenses = async (query_args, properties_to_fetch) => {
    let args = '';

    if (query_args){
        args = `(${query_args})`;
    }

    const query = `
        {
            lenses${args}{
                ... on Lenses { 
                    lenses{
                        ${properties_to_fetch}
                    }
                }
            }  
        }
    `
    const res = await fetch_graphql(query);
    return res.lenses.lenses[0];
}

