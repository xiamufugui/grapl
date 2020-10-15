// const { initialize_graph } = require('../modules/initialize_graph.js');
// const { get_process } = require('../modules/nodes/get_process.js');
// const { get_lens } = require('../modules/nodes/get_lens.js');
// const { get_lenses } = require('../modules/nodes/get_lenses.js');

// beforeAll(async () => {
//     return await initialize_graph();
// });

test('GraphQL Test Suite Running', () => {
    expect('true').toBe('true')
})

// test('Test GraphQL Get Lens, With Args', async () => {
//     const lens_response = await get_lens('lens_name: "test_lens"', 'uid, lens_name');
//     expect(lens_response).toBeTruthy();

//     const lens = lens_response.lens_scope;

//     console.log("lens", lens)

//     expect((typeof lens.uid) === 'number').toBe(true);
//     expect((typeof lens.lens_name) === 'string').toBe(true);
// })

// test('Test GraphQL Get Process No Args', async () => {
//     const process_response = await get_process('', 'uid, node_key');
//     expect(process_response).toBeTruthy();
//     expect(process_response.process).toBeTruthy();

//     const process = process_response.process;
//     validate_base_node(process);
// })

// test('Test GraphQL Get Process With PID', async () => {
//     const process_response = await get_process('process_id: 1234', 'uid, node_key, process_id');
//     expect(process_response).toBeTruthy();
//     expect(process_response.process).toBeTruthy();

//     const process = process_response.process;
//     validate_base_node(process);
//     expect((typeof process.process_id) === 'number').toBe(true);
// })

// test('Test GraphQL Lenses Query', async() => {
//     const args = `first:${10}, offset:${0}`;
//     const properties = 'uid, node_key, dgraph_type, lens_name, score, lens_type';
//     const lenses_response = await get_lenses(args, properties );
    
//     expect(lenses_response).toBeTruthy();
//     expect((typeof lenses_response.uid === 'number')).toBe(true);
//     expect((typeof lenses_response.dgraph_type[0] === 'string')).toBe(true);
//     expect((typeof lenses_response.lens_name === 'string')).toBe(true);
//     expect((typeof lenses_response.score === 'number')).toBe(true);
//     expect((typeof lenses_response.lens_type === 'string')).toBe(true);

//     console.log(lenses_response);
// })

// const validate_base_node = (node) => {
//     expect(node.uid).toBeTruthy();
//     expect((typeof node.uid) === 'number').toBe(true);
//     expect(node.node_key).toBeTruthy();
//     expect((typeof node.node_key) === 'string').toBe(true);
// }
