const { BaseNode } = require('./base_node.js');
const { defaultProcessOutboundConnectionsResolver } = require ('../default_field_resolvers/process_outbound_connection_resolver.js');
const { defaultProcessInboundConnectionsResolver } = require('../default_field_resolvers/process_inbound_connection_resolvers');
const { defaultRisksResolver } = require('../default_field_resolvers/risk_resolver.js');
const { defaultProcessesResolver, defaultProcessResolver } = require('../default_field_resolvers/process_resolver.js');

const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
}  = require('graphql');

const { 
    VarAllocator,
    generateFilter,
    varTypeList,
    reverseMap
} = require('../var_allocator.js')

const ProcessType = new GraphQLObjectType({
    name : 'Process',
    fields : () => {
        const { defaultFileResolver, defaultFilesResolver } = require('../default_field_resolvers/file_resolver.js');

        return {
            ...BaseNode,
            created_timestamp: {type: GraphQLInt},
            image_name: {type: GraphQLString},
            process_name: {type: GraphQLString},
            process_id: {type: GraphQLInt},
            arguments: {type: GraphQLString}, 
            parent: defaultProcessResolver('parent'),
            children: defaultProcessesResolver('children'),
            bin_file: defaultFileResolver('bin_file'),
            created_files: defaultFilesResolver('created_files'),
            deleted_files: defaultFilesResolver('deleted_files'),
            read_files: defaultFilesResolver('read_files'),
            wrote_files: defaultFilesResolver('wrote_files'),
            created_connections: defaultProcessOutboundConnectionsResolver('created_connections'),
            inbound_connections: defaultProcessInboundConnectionsResolver('inbound_connections'),
            risks: defaultRisksResolver('risks'),
        }
    }
});


const getChildren = async (dg_client, parentUid, childrenFilters) => {
    const varAlloc = new VarAllocator();
    
    varAlloc.alloc(childrenFilters.pid, 'int');
    varAlloc.alloc(childrenFilters.processName, 'string');

    const varTypes = varTypeList(varAlloc);
    const filter = generateFilter(varAlloc);
    const varListArray = Array.from(varAlloc.vars.keys());
    
    if (varListArray.indexOf('uid') === -1) {
        varListArray.push('uid');
    }
    
    if (varListArray.indexOf('node_key') === -1) {
        varListArray.push('node_key');
    }
    
    const varList = varListArray.join(", ");
    
    const query = `
        query process(${varTypes})
        {
            process(func: uid(${parentUid}))
            {
                children  @filter(
                    ${filter}
                ) {
                    ${varList}
                }
        
            }
        }
    `;

    const txn = dg_client.newTxn();

    try {
        const res = await txn.queryWithVars(query, reverseMap(varAlloc.vars));
        const parent = res.getJson()['process'][0];

        if (!parent) {
            return []
        }

        return parent['children'] || [];
    } 
    finally {
        await txn.discard();
    }
}

module.exports = {
    ProcessType,
    getChildren
}