const { getDgraphClient } = require('./dgraph_client.js');
const { getLenses } = require('./API/queries/lenses.js');
const { getProcess } = require('./API/queries/process.js');
const { handleLensScope } = require('./API/queries/lensScope.js');

const { 
    _Lens,
    _LensScope,
    _Process
} = require('../modules/API/error_types.js');

const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
    GraphQLBoolean,
    GraphQLSchema, 
    GraphQLUnionType, 
    GraphQLNonNull
}  = require('graphql');

const { // custom types
    BaseNode, 
    LensNodeType, 
    RiskType, 
    FileType, 
    IpConnections, 
    ProcessType, 
    NetworkConnection, 
    IpPort,     
    IpAddressType, 
    AssetType, 
    ProcessOutboundConnections, 
    ProcessInboundConnections, 
    builtins, 
    PluginType, 
    GraplEntityType
} = require('../modules/API/types.js');

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType', 
    fields: {
        lenses: {
            type: _Lens, 
            args: {
                first: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                offset: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: async (parent, args) => {
                const first = args.first;
                const offset = args.offset; 
                // #TODO: Make sure to validate that 'first' is under a specific limit, maybe 1000
                try {
                    const lenses =  await getLenses(getDgraphClient(), first, offset);
                    
                    console.log('lenses', lenses);
                    
                    return lenses;
                } catch (e) {
                    console.log("Error: Lenses Query Failed ", e);
                    return errMsgs(500, 'Lenses')
                }
                
            } 
        },
        lens_scope:{
            type: _LensScope,
            args: {
                lens_name: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: async (parent, args) => {
                try {
                    return await handleLensScope(parent, args);
                } catch (e) { 
                    console.log("Error: Lens Scope Query Failed ", e);
                    return errMsgs(500, 'Lens Scope'); 
                }
            }
        },
        process:  {
            type: _Process,
            args: {
                pid: {type: GraphQLInt}, 
                process_name: {type: GraphQLString}
            }, 
            resolve: async (parent, args) => {
                try{
                    const process = await getProcess(getDgraphClient(), args); 
                    console.log("Process Found", process)
                    return process; 
                } catch (e) {
                    console.log("Error: Process Query Failed ", e);
                    return {
                        error_message: "Process query failed"
                    };
                }   
            }
        }
        
    }
})


module.exports = new GraphQLSchema({
    query: RootQuery
});
