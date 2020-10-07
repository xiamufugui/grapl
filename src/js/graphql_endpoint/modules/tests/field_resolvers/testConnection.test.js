const { initializeGraph, getProcess } = require('./testFunctions.js');

beforeAll(async () => {
    return await initializeGraph();
});


test('GraphQL Test Suite Running', () => {
    expect('true').toBe('true')
})

// test('Test GraphQL Server Running', async () => {
//     expect(await testConnection()).toBeTruthy();
// })


// Given a process in our database
// When we query for any process
// Then we should receive that process
test('Test GraphQL Get Process No Args', async () => {
    const processResponse = await getProcess('', 'uid, node_key');
    expect(processResponse).toBeTruthy();
    expect(processResponse.process).toBeTruthy();

    const process = processResponse.process;
    validateBaseNode(process);
})

test('Test GraphQL Get Process With Pid', async () => {
    const processResponse = await getProcess('process_id: 1234', 'uid, node_key, process_id');
    expect(processResponse).toBeTruthy();
    expect(processResponse.process).toBeTruthy();

    const process = processResponse.process;
    validateBaseNode(process);
    expect((typeof process.process_id) === 'number').toBe(true);

})


const validateBaseNode = (node) => {

    expect(node.uid).toBeTruthy();
    expect((typeof node.uid) === 'number').toBe(true);
    
    expect(node.node_key).toBeTruthy();
    expect((typeof node.node_key) === 'string').toBe(true);
}
