const create_node = require('./create_node').create_node;

module.exports.initialize_graph = async () => {

    create_node("process_key", "Process", [
        ["process_name", "chrome.exe"],
        ["node_key", "test_process"],
        ["image_name", "image.jpg"],
        ["process_id", 1234],
        ["arguments", "args"],
    ])

    create_node("file_key", "File", [
        ["file_path", "/home/andrea/tests/file.txt"],
    ])

    create_node("lens_node_key", "Lens", [
        ["lens_name", "test_lens"]    
    ])

    create_node("lenses_node_key", "Lenses", [
        ["node_key", "test_lenses"],
        ["dgraph_type", "file"],
        ["lens_name", "test_lens"],
        ["score", 90],
        ["lens_type", "file"]
    ])
}
