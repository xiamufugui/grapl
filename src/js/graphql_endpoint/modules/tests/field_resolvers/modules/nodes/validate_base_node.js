const validate_base_node = (node) => {
    expect(node.uid).toBeTruthy();
    expect((typeof node.uid) === 'number').toBe(true);
    expect(node.node_key).toBeTruthy();
    expect((typeof node.node_key) === 'string').toBe(true);
}

module.exports = {
    validate_base_node
}