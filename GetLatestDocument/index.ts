import { AzureFunction, Context, HttpRequest, Logger } from "@azure/functions"
import { RepositoryDataDocument } from "../app/config";
import { getLatestDocument } from "../app/latestData";
const process = require('process'); // https://nodejs.org/api/process.html

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const callback = (req.query.callback || (req.body && req.body.callback));
    const project = (req.query.project || (req.body && req.body.project));

    if (callback && project) {
        const result: RepositoryDataDocument = await getLatestDocument(project);
        const jsonResult = JSON.stringify(result);
        context.res = {
            status: 200,
            body: `${callback}(${jsonResult});`
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a callback and a project on the query string or in the request body"
        };
    }
};

export default httpTrigger;
