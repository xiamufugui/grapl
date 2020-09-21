use inflector::Inflector;
use syn::{Field, Type};

pub fn name_and_py_ty_str(field: &Field) -> Option<(String, String)> {
    match &field.ty {
        Type::Path(typepath) if typepath.qself.is_none() => typepath
            .path
            .segments
            .iter()
            .next()
            .map(|segment| {
                let py_type = match &segment.ident.to_string()[..] {
                    "String" => Some("str"),
                    "i64" | "u64" => Some("int"),
                    _ => None,
                };
                py_type.map(|py_type| {
                    (
                        field.ident.as_ref().unwrap().to_string(),
                        py_type.to_string(),
                    )
                })
            })
            .flatten(),
        _ => None,
    }
}

pub fn format_node_path(name: &str) -> String {
    format!("nodes/{}_node.py", name.to_string().to_snake_case())
}

pub fn format_py_node_schema(name: &str, fields: Vec<(String, String)>) -> String {
    let mut properties = "".to_string();
    for (field_name, field_type) in fields {
        let property_def = format!(
            r#"                "{field_name}": PropType(PropPrimitive.{field_type}, False),{nl}"#,
            field_name = field_name,
            field_type = field_type.to_pascal_case(),
            nl = "\n"
        );

        properties.push_str(property_def.as_str());
    }
    format!(
        r#"class {name}NodeSchema(EntitySchema):
    def __init__(self):
        from model_plugins.{{plugin_name}}.nodes.{name_snake}_node import (
            {name}View,
        )

        super({name}NodeSchema, self).__init__(
            properties={{
{properties}            }},
            edges={{}},
            view=lambda: {name}View,
        )

    @staticmethod
    def self_type() -> str:
        return "{name}"


"#,
        name = name,
        name_snake = name.to_snake_case(),
        properties = properties
    )
}

pub fn format_py_node(name: &str, fields: Vec<(String, String)>) -> String {
    format!(
        r#"from typing import *

from grapl_analyzerlib.comparators import StrCmp, IntOrNot
from grapl_analyzerlib.prelude import *
from grapl_analyzerlib.queryable import with_str_prop, with_int_prop

SelfQ = TypeVar("SelfQ", bound="{node_name}Query")
SelfV = TypeVar("SelfV", bound="{node_name}View")

{query}
{view}

from model_plugins.{{plugin_name}}.schemas import {node_name}NodeSchema
{node_name}NodeSchema().init_reverse()
"#,
        node_name = name,
        query = format_py_node_query(name, fields.clone()),
        view = format_py_node_view(name, fields.clone()),
    )
    .to_string()
}

fn format_py_node_query(node_name: &str, field_names: Vec<(String, String)>) -> String {
    let mut field_defs = String::from("");
    for (field_name, field_type) in field_names {
        let with_method = match &field_type[..] {
            "str" => format_py_query_str_field(&field_name),
            "int" => format_py_query_int_field(&field_name),
            _ => "".to_string(),
        };
        field_defs.push_str(with_method.as_str());
    }

    format!(
        r#"
class {node_name}Query(EntityQuery[SelfV, SelfQ]):
    def __init__(self) -> None:
        super({node_name}Query, self).__init__()
{field_defs}
    @classmethod
    def node_schema(cls) -> "{node_name}NodeSchema":
        return {node_name}NodeSchema()
"#,
        node_name = node_name,
        field_defs = field_defs,
    )
}

fn format_py_node_view(node_name: &str, fields: Vec<(String, String)>) -> String {
    let mut field_param_defs = "".to_string();
    let mut field_inits = "".to_string();
    let mut get_methods = "".to_string();
    for (field_name, field_type) in fields {
        field_param_defs.push_str(
            format!(
                "        {field_name}: Optional[{field_type}] = None,\n",
                field_name = field_name,
                field_type = field_type
            )
            .as_str(),
        );

        field_inits.push_str(
            format!(
                "        self.set_predicate(\"{field_name}\", {field_name})\n",
                field_name = field_name,
            )
            .as_str(),
        );

        get_methods
            .push_str(format_py_view_field(field_name.as_str(), field_type.as_str()).as_str());
    }
    format!(
        r#"
class {node_name}View(EntityView[SelfV, SelfQ]):
    queryable = {node_name}Query
    def __init__(
        self,
        graph_client: GraphClient,
        node_key: str,
        uid: str,
        node_types: Set[str],
{field_param_defs}        **kwargs,
    ):
        super({node_name}View, self).__init__(
            uid, node_key, graph_client, node_types, **kwargs
        )

{field_inits}
{get_methods}
    @classmethod
    def node_schema(cls) -> "{node_name}NodeSchema":
        return {node_name}NodeSchema()
    "#,
        node_name = node_name,
        field_param_defs = field_param_defs,
        field_inits = field_inits,
        get_methods = get_methods,
    )
}

fn format_py_query_str_field(field_name: &str) -> String {
    format!(
        r#"
    @with_str_prop("{field_name}")
    def with_{field_name}(
        self: "SelfQ",
        *,
        eq: Optional[StrCmp] = None,
        contains: Optional[StrCmp] = None,
        ends_with: Optional[StrCmp] = None,
        starts_with: Optional[StrCmp] = None,
        regexp: Optional[StrCmp] = None,
        distance: Optional[Tuple[StrCmp, int]] = None,
    ) -> "SelfQ":
        pass
"#,
        field_name = field_name
    )
}

fn format_py_query_int_field(field_name: &str) -> String {
    format!(
        r#"
    @with_int_prop("{field_name}")
    def with_{field_name}(
        self: "SelfQ",
        *,
        eq: Optional["IntOrNot"] = None,
        gt: Optional["IntOrNot"] = None,
        ge: Optional["IntOrNot"] = None,
        lt: Optional["IntOrNot"] = None,
        le: Optional["IntOrNot"] = None,
    ) -> "SelfQ":
        pass
"#,
        field_name = field_name
    )
}

fn format_py_view_field(field_name: &str, field_type: &str) -> String {
    format!(
        r#"
    def get_{field_name}(self, cached=True) -> Optional[{field_type}]:
        return self.get_{field_type}("{field_name}", cached=cached)
"#,
        field_name = field_name,
        field_type = field_type,
    )
}
