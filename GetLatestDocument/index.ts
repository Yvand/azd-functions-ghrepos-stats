import { AzureFunction, Context, HttpRequest, Logger } from "@azure/functions"
import { RepositoryDataDocument } from "../app/config";
import { getLatestCosmosDocument } from "../app/latestData";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const callback = (req.query.callback || (req.body && req.body.callback));
    const project = (req.query.project || (req.body && req.body.project));

    if (callback && project) {
        const document: RepositoryDataDocument = await getLatestCosmosDocument(project);
        const stringifiedDocument = JSON.stringify(document);
        context.res = {
            status: 200,
            body: `${callback}(${stringifiedDocument});`
        };
        context.log(`[${project}] HTTP function GetLatestDocument processed a request.`);
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a callback and a project as query strings or in the request body"
        };
    }
};

export default httpTrigger;
