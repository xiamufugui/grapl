const getDgraphClient = require('../../dgraph_client.js').getDgraphClient;
const getLensByName = require('./lenses').getLensByName;
const inLensScope = require('./lenses').inLensScope;
const getNodeWithNeighbors = require('./node.js').getNodeWithNeighbors;
const getRisksFromNode = require('./node.js').getRisksFromNode;
const builtins = require('../../node_types/grapl_entity.js').builtins;
const assert = require('assert').strict;


const assertNodeValid = (node) => {
    const typeList = node.dgraph_type.filter(
        (t) => (t !== 'Base' && t !== 'Entity')
    );
    
    assert(typeList.length > 0);
}

module.exports.handleLensScope = async (parent, args) => {

    console.log("ARGS**",args)
    const dg_client = getDgraphClient();
    const lens_name = args.lens_name;
    const lens = await getLensByName(dg_client, lens_name);

    console.log("full lens", lens)

    if(!lens["scope"]){
        return [];
    } 

    for (const node of lens["scope"]) {
        // Make sure the object is actually a node
        assertNodeValid(node);

        // For every node in our lens scope make a query to DGraph to get any adjacent/neighbor nodes.
        const nodeWithNeighbors = await getNodeWithNeighbors(dg_client, node["uid"]);

        console.log("nodeWithNeighbors", nodeWithNeighbors);
        
        // iterate through the neigbhor nodes
        for (const nodeProp in nodeWithNeighbors) {
            const possibleNeighborNode = nodeWithNeighbors[nodeProp];            
            // A neighbor is either an array representing edges where each node object contains a base node (uid, dgraph_type, node_key) ...
            
            // if (Array.isArray(possibleNeighbor) && possibleNeighbor && possibleNeighbor[0].uid) {
            if (Array.isArray(possibleNeighborNode) && possibleNeighborNode[0].uid) {
            // const neighbors = possibleNeighbor;
                for (const prop of possibleNeighborNode) {
                    if (!prop.dgraph_type) { continue }
                        // neighbor.dgraph_type = neighbor.dgraph_type.filter((t) => (t !== 'Base' && t !== 'Entity'))
                        const isInScope = await inLensScope(dg_client, prop["uid"], lens["uid"]);
                        // returns true or false (in scope or not)
                        console.log(prop, "is In Scope: array", isInScope);   
                        // if node prop is an array,
                        if (isInScope) {
                            prop.uid = parseInt(prop.uid, 16);

                            if (Array.isArray(node[nodeProp])) {
                                node[nodeProp].push(prop);
                            } else {
                                node[nodeProp] = [prop];
                        }
                    }
                }
            }
            // ...or an object representing an edge 
            else if ((typeof possibleNeighborNode === 'object') && possibleNeighborNode.uid) {
                // const neighbor = possibleNeighborNode;
                // neighbor.dgraph_type = neighbor.dgraph_type.filter((t) => (t !== 'Base' && t !== 'Entity'))

                const isInScope = await inLensScope(dg_client, possibleNeighborNode["uid"], lens["uid"]);
                console.log(prop, "is in scope, object", isInScope)
                if (isInScope) {
                    
                    possibleNeighborNode.uid = parseInt(possibleNeighborNode.uid, 16);

                    if(!builtins.has(possibleNeighborNode.dgraph_type[0])) {
                        
                        const tmpNode = {...possibleNeighborNode};
                        // Object.keys(node).forEach(function(key) { delete node[key]; });
                        possibleNeighborNode.predicates = tmpNode;
                    }
                    node[nodeProp] = possibleNeighborNode;
                }
            }
        }
    }

    console.log("Lens*", lens)

    for (const node of lens["scope"]) {
        // node.dgraph_type = node.dgraph_type.filter((t) => (t !== 'Base' && t !== 'Entity'))
        try {
            let nodeUid = node['uid'];

            if (typeof nodeUid === 'number') {
                nodeUid = '0x' + nodeUid.toString(16);
            }

            const risks = await getRisksFromNode(dg_client, nodeUid);

            if (risks) {
                for (const risk of risks) {
                    // risk['dgraph_type'] = risk['dgraph_type'].filter((t) => (t !== 'Base' && t !== 'Entity'))

                    risk['uid'] = parseInt(risk['uid'], 16)
                }
                node['risks'] = risks;
            }
        } catch (err) {
            console.error('Failed to get risks', err);
        }
        node.uid = parseInt(node.uid, 16);
        // If it's a plugin we want to store the properties in a wrapper

        if(!builtins.has(node.dgraph_type[0])) {
            const tmpNode = {...node};
            node.predicates = tmpNode;
        }
    }

    // for (const node of lens["scope"]) {
    //     node.dgraph_type = node.dgraph_type.filter((t) => (t !== 'Base' && t !== 'Entity'))
    // }

    lens.uid = parseInt(lens.uid, 16);

    console.log("Returning lens", lens)

    return lens;
}
