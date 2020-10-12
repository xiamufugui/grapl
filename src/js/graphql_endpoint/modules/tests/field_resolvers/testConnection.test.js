const { initializeGraph, getProcess, getLens, getLenses } = require('./testFunctions.js');

beforeAll(async () => {
    return await initializeGraph();
});


test('GraphQL Test Suite Running', () => {
    expect('true').toBe('true')
})

test('Test GraphQL Get Lens, With Args', async () => {
    const lensResponse = await getLens('lens_name: "test_lens"', 'uid, lens_name');
    // console.log("lensResponse", lensResponse);
    expect(lensResponse).toBeTruthy();

    const lens = lensResponse.lens_scope;

    expect((typeof lens.uid) === 'number').toBe(true);
    expect((typeof lens.lens_name) === 'string').toBe(true);
})

test('Test GraphQL Get Process No Args', async () => {
    const processResponse = await getProcess('', 'uid, node_key');
    expect(processResponse).toBeTruthy();
    expect(processResponse.process).toBeTruthy();

    const process = processResponse.process;
    validateBaseNode(process);
})

test('Test GraphQL Get Process With PID', async () => {
    const processResponse = await getProcess('process_id: 1234', 'uid, node_key, process_id');
    expect(processResponse).toBeTruthy();
    expect(processResponse.process).toBeTruthy();

    const process = processResponse.process;
    validateBaseNode(process);
    expect((typeof process.process_id) === 'number').toBe(true);
})

test('Test GraphQL Lenses Query', async() => {
    const args = `first:${10}, offset:${0}`;
    const properties = 'uid, node_key, dgraph_type, lens_name, score, lens_type';
    const lensesResponse = await getLenses(args, properties );
    
    expect(lensesResponse).toBeTruthy();
    expect((typeof lensesResponse.uid === 'number')).toBe(true);
    expect((typeof lensesResponse.dgraph_type[0] === 'string')).toBe(true);
    expect((typeof lensesResponse.lens_name === 'string')).toBe(true);
    expect((typeof lensesResponse.score === 'number')).toBe(true);
    expect((typeof lensesResponse.lens_type === 'string')).toBe(true);

    console.log(lensesResponse);
})

const validateBaseNode = (node) => {
    expect(node.uid).toBeTruthy();
    expect((typeof node.uid) === 'number').toBe(true);
    expect(node.node_key).toBeTruthy();
    expect((typeof node.node_key) === 'string').toBe(true);
}
