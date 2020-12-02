const getDgraphClient = require('./dgraph_client.js').getDgraphClient;
const getLenses = require('./API/queries/lenses.js').getLenses;
const handleLensScope = require('./API/queries/lensScope.js').handleLensScope;
const getNode = require('./API/queries/node.js').getNode;

const LensWithErrors = require('../modules/API/error_types.js').LensWithErrors;
const LensScopeWithErrors = require('../modules/API/error_types.js').LensScopeWithErrors;
const ProcessWithErrors = require('../modules/API/error_types.js').ProcessWithErrors;

const { 
    GraphQLObjectType, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLNonNull,
    GraphQLSchema
}  = require('graphql');

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType', 
    fields: () => {
        return {
            lenses: {
                type: LensWithErrors, 
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
                    // #TODO: make this look like other nodes (ref. process)
                    try {
                        const lenses =  await getLenses(getDgraphClient(), first, offset);
                        console.log('lenses', lenses);
                        return {lenses};
                    } catch (e) {
                        console.log("Error: Lenses Query Failed ", e);
                        return;
                    }
                    
                } 
            },
            lens_scope:{
                type: LensScopeWithErrors,
                args: {
                    lens_name: {type: new GraphQLNonNull(GraphQLString)},
                    score: {type: GraphQLInt},
                    lens_type: {type: GraphQLString}
                },
                resolve: async (parent, args) => {
                    try {
                        // console.log("handleLensScope")
                        // return await handleLensScope(parent, args);
                        const lens = await getNode(
                            getDgraphClient(), 
                            'Lens',
                            [
                                ['lens_name', args.lens_name, 'string'],
                                ['score', args.score, 'int'],
                                ['lens_type', args.lens_type, 'string']
                            ]
                        );
                        console.log("lens", lens)
                        return lens; 
                    } catch (e) { 
                        console.log("Error: Lens Scope Query Failed ", e);
                        return;
                    }
                }
            },
            process:  {
                type: ProcessWithErrors,
                args: {
                    process_id: {type: GraphQLInt}, 
                    process_name: {type: GraphQLString}
                }, 
                resolve: async (parent, args) => {
                    try{
                        const process = await getNode(
                            getDgraphClient(), 
                            'Process',
                            [
                                ['process_id', args.process_id, 'int'],
                                ['process_name', args.process_name, 'string'],
                            ]
                        ); 
                        console.log("Process Found ", process)
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
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
});