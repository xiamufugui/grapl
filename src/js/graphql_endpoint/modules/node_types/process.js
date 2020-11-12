const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList,
}  = require('graphql');

const { 
    VarAllocator,
    generateFilter,
    varTypeList,
    reverseMap
} = require('../var_allocator.js')

module.exports.ProcessType = new GraphQLObjectType({
    name : 'Process',
    fields : () => {
        const defaultFilesResolver = require('../default_field_resolvers/file_resolver.js').defaultFilesResolver;
        const defaultFileResolver  = require('../default_field_resolvers/file_resolver.js').defaultFileResolver;

        const BaseNode = require('./base_node.js').BaseNode;
        const defaultProcessOutboundConnectionsResolver = require ('../default_field_resolvers/process_outbound_connection_resolver.js').defaultProcessOutboundConnectionsResolver;
        const defaultProcessInboundConnectionsResolver = require('../default_field_resolvers/process_inbound_connection_resolvers').defaultProcessInboundConnectionsResolver;
        const defaultRisksResolver = require('../default_field_resolvers/risk_resolver.js').defaultRisksResolver;
        const defaultProcessesResolver = require('../default_field_resolvers/process_resolver.js').defaultProcessesResolver;
        const defaultProcessResolver  = require('../default_field_resolvers/process_resolver.js').defaultProcessResolver;
        const defaultLensNodesResolver = require('../default_field_resolvers/lens_node_resolver.js').defaultLensNodesResolver;
        
        return {
            ...BaseNode,
            created_timestamp: {type: GraphQLInt},
            image_name: {type: GraphQLString},
            process_name: {type: GraphQLString},
            process_id: {type: GraphQLInt},
            arguments: {type: GraphQLString},
            // scopes: {
            //     type: GraphQLList(GraphQLString),
            //     args: {
            //         lens_name: {type: GraphQLString}
            //     },
            //     resolve: async (srcNode, args) => {
            //         console.log("getting scopes for: ", srcNode, args);
            //         const lensNames = await getScopes(getDgraphClient(), srcNode.uid, args.lens_name);
            //         console.log("lensNAmes", lensNames);
            //         return lensNames
            //     }
            // },
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
            in_scope: defaultLensNodesResolver('in_scope'),
        }
    }
});


module.exports.getChildren = async (dg_client, parentUid, childrenFilters) => {
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
