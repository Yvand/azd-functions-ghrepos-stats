import * as Config from "./config";
import { CosmosClient, FeedOptions, Database, Container, SqlQuerySpec } from "@azure/cosmos";

// https://stackoverflow.com/questions/58783925/how-to-query-from-cosmosdb-in-azure-function-with-typescript
// https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-cosmos/3.6.2/index.html
// https://nbellocam.dev/blog/functions-cosmos-typescript/

// use CosmosClient as documented in https://docs.microsoft.com/en-us/azure/azure-functions/manage-connections#cosmosclient-code-example-javascript
const cosmosClient = new CosmosClient({endpoint: Config.endpoint, key: Config.key});
const container = cosmosClient.database(Config.database).container(Config.container);
const options: FeedOptions = {
    maxItemCount: 1,
    maxDegreeOfParallelism: 0,
    bufferItems: false
};

const getLatestDocument = async function (repositoryName: string): Promise<Config.RepositoryDataDocument> {
    var querySpec: SqlQuerySpec = {
        query: Config.latestDocumentQuery,
        parameters: [{
            name: '@Repository',
            value: repositoryName
        }]
    };
    
    let result;
    const { resources: results } = await container.items.query(querySpec, options).fetchAll();
    if (results != undefined) {
        result = results[0];
    }
    return result;
}

export {getLatestDocument as getLatestCosmosDocument};