const { testConnection } = require('./testFunctions.js');

test('GraphQL Test Suite Running', () => {
    expect('true').toBe('true')
})



test('Test GraphQL Server Running', () => {
    expect(testConnection()).toBeTruthy();
})
    
