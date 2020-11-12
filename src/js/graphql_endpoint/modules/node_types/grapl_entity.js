const { 
    GraphQLUnionType, 
}  = require('graphql');

module.exports.builtins = new Set([
    'Process',
    'File',
    'IpAddress',
    'Asset',
    'Risk',
    'IpConnections',
    'ProcessInboundConnections',
    'ProcessOutboundConnections',
])

const resolveType = (data) => {
    if (data.dgraph_type[0] === 'Process') {
        return 'Process';
    }

    if (data.dgraph_type[0] === 'File') {
        return 'File';
    }

    if (data.dgraph_type[0] === 'IpAddress') {
        return 'IpAddress';
    }
    
    if (data.dgraph_type[0] === 'Asset') {
        return 'Asset';
    }

    if (data.dgraph_type[0] === 'Risk'){
        return 'Risk';
    }

    if (data.dgraph_type[0] === 'IpConnections'){
        return 'IpConnections';
    }

    if (data.dgraph_type[0] === 'ProcessInboundConnections'){
        return 'ProcessInboundConnections';
    }

    if (data.dgraph_type[0] === 'ProcessOutboundConnections'){
        return 'ProcessOutboundConnections';
    }
    
    return 'PluginType'
};

// ## TODO - ADD ALL NON-DYNAMIC TYPES  
    
module.exports.GraplEntityType = new GraphQLUnionType({
    name: 'GraplEntityType',
    types: () => {
        const PluginType = require('./plugin.js').PluginType;
        const FileType = require('./file.js').FileType;
        const ProcessType = require('./process.js').ProcessType; 
        const AssetType = require('./asset.js').AssetType;

        return [ PluginType, FileType, ProcessType, AssetType ]
    },
    resolveType: resolveType
});
