import { FeedOptions } from "@azure/cosmos";
import { RepositoryDataDocument, Settings } from "./common";
const { CosmosClient } = require("@azure/cosmos");


const endpoint = Settings.CosmosEndpoint;
const key = Settings.CosmosKey;
const client = new CosmosClient({ endpoint, key });
const latestDocumentQuery: string = "SELECT TOP 1 * FROM c WHERE c.Repository = @Repository ORDER BY c.DateStatCreatedTicks DESC";

export async function GetLatestDocument(repository: string): Promise<RepositoryDataDocument> {
    // doc Containers class: https://learn.microsoft.com/en-us/javascript/api/@azure/cosmos/containers?view=azure-node-latest
    const container = await client.database(Settings.CosmosDatabaseId).containers.createIfNotExists({ id: Settings.CosmosCollectionId });

    const now = new Date();
    const yyyyMMRegex: string = "^\\d\\d\\d\\d-\\d\\d";
    const yyyyMMArray = now.toISOString().match(yyyyMMRegex)

    // doc FeedOptions: https://learn.microsoft.com/en-us/javascript/api/%40azure/cosmos/feedoptions?view=azure-node-latest
    const options: FeedOptions = {
        maxItemCount: 1,
        bufferItems: false,
        partitionKey: yyyyMMArray, // Limits the query to a specific partition key. Default: undefined
    };

    const { resources, diagnostics } = await container.container.items
        .query({
            query: latestDocumentQuery,
            parameters: [{ name: "@Repository", value: repository }]
        }, options)
        .fetchAll();    // https://learn.microsoft.com/en-us/javascript/api/@azure/cosmos/queryiterator?view=azure-node-latest#@azure-cosmos-queryiterator-fetchall
    return resources?.length === 1 ? resources[0] : undefined;
}