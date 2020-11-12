const initialize_graph = require('../modules/initialize_graph').initialize_graph;
const get_process = require('../modules/nodes/get_process').get_process;
const validate_base_node = require('../modules/nodes/validate_base_node').validate_base_node;

beforeAll(async () => {
    return await initialize_graph();
});

test('Test GraphQL Get Process No Args', async () => {
    const process_response = await get_process('', 'uid, node_key');
    expect(process_response).toBeTruthy();
    expect(process_response.process).toBeTruthy();

    const process = process_response.process;
    validate_base_node(process);
})

test('Test GraphQL Get Process With PID', async () => {
    const queryArgs = 'process_id: 1234';
    const properties = 'uid, node_key, dgraph_type, created_timestamp, image_name, process_name, process_id, arguments';
    const process_response = await get_process(queryArgs, properties);
    const process = process_response.process;    
    expect(process_response).toBeTruthy();
    expect(process).toBeTruthy();

    expect((typeof process.process_id) === ('number' || null)).toBe(true);
    // expect((typeof process.image_name) === ('string' || 'object')).toBe(true);
    
    validate_base_node(process);
    expect((typeof process.process_id) === ('number' || null)).toBe(true);
})
