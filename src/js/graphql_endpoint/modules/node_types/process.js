const { getDgraphClient } = require('../dgraph_client.js');
const { getEdges, getEdge, expandTo } = require('../API/queries/edge.js');

const { BaseNode } = require('./base_node.js');
const { defaultProcessOutboundConnectionsResolver } = require ('../default_field_resolvers/process_outbound_connection_resolver.js');
const { ProcessInboundConnections } = require('./process_inbound_connections.js');
const { RiskType } = require('./risk.js');

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

const processArgs = () => {
    return {
        process_id: {type: GraphQLInt}, 
        process_name: {type: GraphQLString},
        created_timestamp: {type: GraphQLInt},
        image_name: {type: GraphQLString},
    }
}

const processFilters = (args) => {
    return [
        ['process_id', args.process_id, 'int'],
        ['process_name', args.process_name, 'string'],
        ['created_timestamp', args.created_timestamp, 'int'],
        ['image_name', args.image_name, 'string'],
    ]
}

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
            parent: {
                type: ProcessType,
                args: processArgs(),
                resolve: async (srcNode, args) => {
                    return await expandTo(getDgraphClient(), srcNode.uid, 'parent', processFilters(args), getEdge);
                }
            },
            children: {
                type: GraphQLList(ProcessType),
                args: processArgs(), 
                resolve: async (parent, args) => {
                    return await expandTo(getDgraphClient(), parent.uid, 'children', processFilters(args), getEdges);
                }
            },
            bin_file: defaultFileResolver('bin_file'),
            created_files: defaultFilesResolver('created_files'),
            deleted_files: defaultFileResolver('deleted_files'),
            read_files: defaultFilesResolver('read_files'),
            wrote_files: defaultFilesResolver('wrote_files'),
            created_connections: defaultProcessOutboundConnectionsResolver('created_connections'),
            inbound_connections: {type: GraphQLList(ProcessInboundConnections)},
            risks: {type: GraphQLList(RiskType)},
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
    processArgs,
    processFilters,
    getChildren
}