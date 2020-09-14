const { getDgraphClient } = require('./dgraph_client.js')

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


const getLenses = async (dg_client, first, offset) => {
    // console.log("first offset", first, offset);
    const query = `
    query all($a: int, $b: int)
    {
        all(func: type(Lens), first: $a, offset: $b, orderdesc: score)
        {
            lens_name,
            score,
            node_key,
            uid,
            dgraph_type: dgraph.type,
            lens_type,
            scope {
                uid,
                node_key,
                dgraph_type: dgraph.type,
            }
        }
    }`;

    const txn = dg_client.newTxn();

    try {
        const res = await txn.queryWithVars(query, {'$a': first.toString(), '$b': offset.toString()});
        return res.getJson()['all'];
    } finally {
        await txn.discard();
    }
}

// return lens
const getLensByName = async (dg_client, lensName) => {
    const query = `
    query all($a: string, $b: first, $c: offset)
        {
            all(func: eq(lens_name, $a), first: 1)
            {
                lens_name,
                score,
                node_key,
                uid,
                dgraph_type: dgraph.type,
                lens_type,
                scope @filter(has(node_key)) {
                    uid,
                    dgraph_type: dgraph.type,
                    expand(_all_)
                }
            }
        }
    `;
    const txn = dg_client.newTxn();
    try {
        const res = await txn.queryWithVars(query, {'$a': lensName});
        return res.getJson()['all'][0];
    } finally {
        await txn.discard();
    }
}
// Return base node 
const getNeighborsFromNode = async (dg_client, nodeUid) => {
    const query = `
    query all($a: string)
    {
        all(func: uid($a), first: 1)
        {
            uid,
            dgraph_type
            expand(_all_) {
                uid,
                dgraph_type: dgraph.type,
                expand(_all_)
            }
        }
    }`;
    const txn = dg_client.newTxn();
    try {
        const res = await txn.queryWithVars(query, {'$a': nodeUid});
        return res.getJson()['all'][0];
    } finally {
        await txn.discard();
    }
}

const getRisksFromNode = async (dg_client, nodeUid) => {
    if (!nodeUid) {
        console.warn('nodeUid can not be null, undefined, or empty')
        return
    }
    const query = `
    query all($a: string)
    {
        all(func: uid($a)) @cascade
        {
            uid,
            dgraph_type: dgraph.type
            node_key
            risks {
                uid
                dgraph_type: dgraph.type
                node_key
                analyzer_name
                risk_score
            }
        }
    }`;
    const txn = dg_client.newTxn();
    try {
        const res = await txn.queryWithVars(query, {'$a': nodeUid});
        return res.getJson()['all'][0]['risks'];
    } finally {
        await txn.discard();
    }
}


const inLensScope = async (dg_client, nodeUid, lensUid) => {

    const query = `
    query all($a: string, $b: string)
    {
        all(func: uid($b)) @cascade
        {
            uid,
            scope @filter(uid($a)) {
                uid,
            }
        }
    }`;

    const txn = dg_client.newTxn();
    try {
        const res = await txn.queryWithVars(query, {
            '$a': nodeUid, '$b': lensUid
        });
        const json_res = res.getJson();
        return json_res['all'].length !== 0;
    } finally {
        await txn.discard();
    }
}


class VarAllocator {
    constructor() {
        // Map from predicate_name to var
        this.vars = new Map();
        this.varTypes = new Map();
        this.nextVar = '$a';
    }

    alloc = (predValue, predType) => {
        if (this.vars[predValue]) {
            return this.vars[predValue];
        }

        this.vars[predValue] = this.incrVar();

        this.varTypes[predType] = this.nextVar;
        
        return this.vars[predValue];
    }

    incrVar = () => {
        if (this.nextVar.slice(-1) === 'z') {
            this.nextVar = this.nextVar + 'a'
        } else {
            const intVar = this.nextVar.slice(-1).charCodeAt(0);
            this.nextVar = String.fromCharCode(intVar + 1) 
        }

        return this.nextVar;
    }
}


const generateFilter = (varAlloc) => {
    const filters = [];
    for (const entry of varAlloc.vars.entries()) {
        filters.push(`eq(${entry[0]}, ${entry[1]})`)
    }
    return filters.join(" AND ")
}


const varTypeList = (varAlloc) => {
    const typedPairs = [];
    for (const entry of varAlloc.vars.entries()) {
        typedPairs.push(`${entry[0]}:${entry[1]}`)
    }

    return typedPairs.join(", ")
}

const reverseMap = (map) => {
    const output = {};
    for (const entry of map.entries()) {
        output[entry[1]] = entry[0];
    }
    return output
}

const getProcess = async (dg_client, filters) => {
    console.log("DGClient", dg_client)
    console.log("Filters", filters)

    const varAlloc = new VarAllocator();
    varAlloc.alloc(filters.pid, 'int');
    varAlloc.alloc(filters.processName, 'string');

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
        process(func: type(Process))

        @filter(
            ${filter}
        )

        {
            ${varList}
        }
    }`;

    const txn = dg_client.newTxn();

    try {
        const res = await txn.queryWithVars(query, reverseMap(varAlloc.vars));
        return res.getJson()['process'];
    } finally {
        await txn.discard();
    }
}


const handleLensScope = async (parent, args) => {
    const dg_client = getDgraphClient();

    const lens_name = args.lens_name;

    const lens = await getLensByName(dg_client, lens_name);

    lens["scope"] = lens["scope"] || [];
    console.log(lens)

    for (const node of lens["scope"]) {
        node.dgraph_type = node.dgraph_type.filter((t) => (t !== 'Base' && t !== 'Entity'))

        // node.uid = parseInt(node.uid, 16);
        if(!node.dgraph_type){
            console.warn("No DGraph Type", node)
        }
        // for every node in our lens scope, get its neighbors

        const nodeEdges = await getNeighborsFromNode(dg_client, node["uid"]);

        for (const maybeNeighborProp in nodeEdges) {
            const maybeNeighbor = nodeEdges[maybeNeighborProp];
            // maybeNeighbor.uid = parseInt(maybeNeighbor.uid, 16);
            
            // A neighbor is either an array of objects with uid fields
            if (Array.isArray(maybeNeighbor) && maybeNeighbor && maybeNeighbor[0].uid) {
                const neighbors = maybeNeighbor;

                for (const neighbor of neighbors) {
                    if (!neighbor.dgraph_type) {continue}
                    neighbor.dgraph_type = neighbor.dgraph_type.filter((t) => (t !== 'Base' && t !== 'Entity'))

                    const isInScope = await inLensScope(dg_client, neighbor["uid"], lens["uid"]);
                    neighbor.uid = parseInt(neighbor.uid, 16);
                    if (isInScope) {
                        if (Array.isArray(node[maybeNeighborProp])) {
                            node[maybeNeighborProp].push(neighbor);
                        } else {
                            node[maybeNeighborProp] = [neighbor];
                        }
                    }
                }
            }
            else if (typeof maybeNeighbor === 'object' && maybeNeighbor.uid) {
                const neighbor = maybeNeighbor;
                neighbor.dgraph_type = neighbor.dgraph_type.filter((t) => (t !== 'Base' && t !== 'Entity'))

                const isInScope = await inLensScope(dg_client, neighbor["uid"], lens["uid"]);
                neighbor.uid = parseInt(neighbor.uid, 16);
                if (isInScope) {
                    if(!builtins.has(neighbor.dgraph_type[0])) {
                        const tmpNode = {...neighbor};
                        // Object.keys(node).forEach(function(key) { delete node[key]; });
                        neighbor.predicates = tmpNode;
                    }
                    node[maybeNeighborProp] = neighbor
                }
            }
        }
    }

    for (const node of lens["scope"]) {
        node.dgraph_type = node.dgraph_type.filter((t) => (t !== 'Base' && t !== 'Entity'))

        try {
            let nodeUid = node['uid'];
            if (typeof nodeUid === 'number') {
                nodeUid = '0x' + nodeUid.toString(16)
            }
            const risks = await getRisksFromNode(dg_client, nodeUid);
            if (risks) {
                for (const risk of risks) {
                    risk['dgraph_type'] = risk['dgraph_type'].filter((t) => (t !== 'Base' && t !== 'Entity'))

                    risk['uid'] = parseInt(risk['uid'], 16)
                }
                node['risks'] = risks;
            }
        } catch (err) {
            console.error('Failed to get risks', err);
        }
        node.uid = parseInt(node.uid, 16);
        // If it's a plugin we want to store the properties in a wrapper
        console.log("Node", node)
        if(!builtins.has(node.dgraph_type[0])) {
            const tmpNode = {...node};
            node.predicates = tmpNode;
        }
    }

    for (const node of lens["scope"]) {
        node.dgraph_type = node.dgraph_type.filter((t) => (t !== 'Base' && t !== 'Entity'))
    }

    lens.uid = parseInt(lens.uid, 16);
    return lens

}

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
