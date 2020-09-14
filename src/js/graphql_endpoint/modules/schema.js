const { getDgraphClient } = require('./dgraph_client.js');
const { getLenses } = require('./API/queries/lenses.js');
const { getProcess } = require('./API/queries/process.js');
const { handleLensScope } = require('./API/queries/lensScope.js');

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
            type: GraphQLList(LensNodeType),
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
                const lenses =  await getLenses(getDgraphClient(), first, offset);
                
                console.log('lenses', lenses);
                
                return lenses
            } 
        },
        lens_scope:{
            type: LensNodeType, 
            args: {
                lens_name: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: async (parent, args) => {
                try {
                    return await handleLensScope(parent, args);
                } catch (e) { 
                    console.error("Failed to handle lens scope", e);
                    throw e;
                }
            }
        },
        process:  {
            type: GraphQLNonNull(GraphQLList(GraphQLNonNull(ProcessType))), 
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
                    console.log("e", e)
                }
            }
        }
        
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
});
