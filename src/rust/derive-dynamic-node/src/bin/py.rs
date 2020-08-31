mod ex;

fn main() {
    let plugin_name = "example";
    println!("{}", ex::AwsEc2Instance::derive_node(plugin_name));
    println!("{}", ex::AwsEc2Instance::derive_schema(plugin_name));
}
