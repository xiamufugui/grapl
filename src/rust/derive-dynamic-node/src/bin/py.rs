mod ex;

fn main() {
    println!("{}", ex::AwsEc2Instance::derive_node());
    println!("{}", ex::AwsEc2Instance::derive_schema());
}
