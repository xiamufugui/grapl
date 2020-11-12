const initialize_graph = require('../modules/initialize_graph.js').initialize_graph;
const get_lenses = require('../modules/nodes/get_lenses.js').get_lenses;

beforeAll(async () => {
    return await initialize_graph();
});

test('Test GraphQL Lenses Query', async() => {
    const args = `first:${10}, offset:${0}`;
    const properties = 'uid, node_key, dgraph_type, lens_name, score, lens_type';
    const lenses_response = await get_lenses(args, properties );
    
    expect(lenses_response).toBeTruthy();
    expect((typeof lenses_response.uid === 'number')).toBe(true);
    expect((typeof lenses_response.dgraph_type[0] === 'string')).toBe(true);
    expect((typeof lenses_response.lens_name === 'string')).toBe(true);
    expect((typeof lenses_response.score === 'number')).toBe(true);
    expect((typeof lenses_response.lens_type === 'string')).toBe(true);

    // console.log(lenses_response);
})
