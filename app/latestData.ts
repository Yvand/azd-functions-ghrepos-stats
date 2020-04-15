import * as Config from "./config";
import { CosmosClient, FeedOptions, Database, Container, SqlQuerySpec } from "@azure/cosmos";

// https://stackoverflow.com/questions/58783925/how-to-query-from-cosmosdb-in-azure-function-with-typescript
// https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-cosmos/3.6.2/index.html
// https://nbellocam.dev/blog/functions-cosmos-typescript/
// https://www.npmjs.com/package/axios

const client = new CosmosClient({endpoint: Config.endpoint, key: Config.key});
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
    // const testQuery = "SELECT TOP 1 c.DateStatCreated, c.Repository, c.LatestAssetUrl, c.LatestReleaseCreationDate, c.LatestReleaseTagName, c.LatestReleaseDownloadCount, c.AllReleasesDownloadCount, c.TotalDownloadCount FROM c WHERE c.Repository = 'Yvand/LDAPCP' ORDER BY c.DateStatCreatedTicks DESC"
    // const queryIterator = await client.database(Config.database).container(Config.container).items.query(testQuery, options);
    const feedResponse = await client.database(Config.database).container(Config.container).items.query(querySpec, options).fetchNext();
    if (feedResponse.resources != undefined) {
        result = feedResponse.resources[0];
    }
    
    // // const queryIterator = await client.database(Config.database).container(Config.container).items.query(querySpec, options);
    // console.log(`endpoint: ${Config.endpoint}`);
    // let count = 0;
    // while (queryIterator.hasMoreResults() && count <= 100000) {
    //     const { resources: results } = await queryIterator.fetchNext();
    //     if (results != undefined) {
    //         count = count + results.length;
    //         result = results[0];
    //     }
    // }
    return result;
}

export {getLatestDocument as getLatestDocument};