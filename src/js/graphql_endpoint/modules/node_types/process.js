const { getDgraphClient } = require('../dgraph_client.js');
const { getEdges } = require('../API/queries/edge.js');

const { BaseNode } = require('./base_node.js');
const { FileType } = require('./file.js');
const { ProcessOutboundConnections } = require('./process_outbound_connections.js');
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

const ProcessType = new GraphQLObjectType({
    name : 'Process',
    fields : () => ({
        ...BaseNode,
        created_timestamp: {type: GraphQLInt},
        image_name: {type: GraphQLString},
        process_name: {type: GraphQLString},
        process_id: {type: GraphQLInt},
        arguments: {type: GraphQLString}, 
        children: {
            type: GraphQLList(ProcessType),
            args: {
                process_id: {type: GraphQLInt}, 
                process_name: {type: GraphQLString}
            }, 
            resolve: async (parent, args) => {
                try{
                    console.log('fetching children of: ', parent.uid, ' with ', args);
                    const children = await getEdges(
                        getDgraphClient(),
                        parent.uid,
                        'children',
                        [
                            ['process_id', args.process_id, 'int'],
                            ['process_name', args.process_name, 'string']
                        ]
                    )
                    console.log("Process Found", children);
                    return children; 
                    
                } catch (e) {
                    console.log("e", e)
                    return 0; 
                }
            }
        },
        bin_file: {type: FileType},
        created_file: {type: FileType},
        deleted_files: {type:FileType},
        read_files: {type: GraphQLList(FileType)},
        wrote_files: {type: GraphQLList(FileType)},
        created_connections: {type: GraphQLList(ProcessOutboundConnections)},
        inbound_connections: {type: GraphQLList(ProcessInboundConnections)},
        risks: {type: GraphQLList(RiskType)},
    })
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