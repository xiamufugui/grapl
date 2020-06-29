import { PluginPayload } from "../plugins/uploadPluginTypes";
import {getModelPluginEdge} from "../../GraphViz/engagement_edge/getApiURLs"

export const getPluginList = async () => {
    const res = await fetch(`${getModelPluginEdge()}listModelPlugins`, 
        {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }
    );

    const body = await res.json();

    let pluginList: string[] = body.success.plugin_list;

    return pluginList
}

export const deletePlugin = async ( pluginName: string ): Promise <boolean> => {
    const res = await fetch(`${getModelPluginEdge()}deleteModelPlugin`, 
        {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({plugins_to_delete: [pluginName]})
        }
    );
    const body = await res.json();

    if (body.success.Success === "Deleted Plugins"){
        return true; 
    } else { 
        console.warn("Unable to Delete Plugin");
        return false; 
    }
};

export const uploadFilesToDgraph = async (payload: PluginPayload ): Promise<boolean> => {
    const res = await fetch(`${getModelPluginEdge()}deploy`, 
        {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        }
    );
    const body = await res.json();
    console.log("body", body)
    return body.success.Success;
};