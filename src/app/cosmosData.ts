import { FeedOptions, CosmosClient, CosmosClientOptions, ContainerResponse } from "@azure/cosmos";
import { RepositoryDataDocument, Settings } from "./common";
import { DefaultAzureCredential } from "@azure/identity";
import { InvocationContext } from "@azure/functions";

// https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme?view=azure-node-latest#defaultazurecredential
const credentials = new DefaultAzureCredential();   // Use managed identity
// https://learn.microsoft.com/en-us/javascript/api/%40azure/cosmos/cosmosclientoptions?view=azure-node-latest
const options: CosmosClientOptions = {
    endpoint: Settings.CosmosEndpoint,
    aadCredentials: credentials,
}
// https://learn.microsoft.com/en-us/javascript/api/@azure/cosmos/cosmosclient?view=azure-node-latest
const client = new CosmosClient(options);
const latestDocumentQuery: string = "SELECT TOP 1 * FROM c WHERE c.Repository = @Repository ORDER BY c.DateStatCreatedTicks DESC";

export async function GetLatestDocument(repository: string, context: InvocationContext): Promise<RepositoryDataDocument | undefined> {
    // https://learn.microsoft.com/en-us/javascript/api/@azure/cosmos/containers?view=azure-node-latest
    const containers: ContainerResponse = await client.database(Settings.CosmosDatabaseId).containers.createIfNotExists({ id: Settings.CosmosCollectionId });
    const now = new Date();
    const partitionKeyRegex: string = "^\\d\\d\\d\\d-\\d\\d";
    const partitionKeyValue = now.toISOString().match(partitionKeyRegex)

    // https://learn.microsoft.com/en-us/javascript/api/%40azure/cosmos/feedoptions?view=azure-node-latest
    const options: FeedOptions = {
        maxItemCount: 1,
        bufferItems: false,
        partitionKey: partitionKeyValue, // Limits the query to a specific partition key. Default: undefined
        // partitionKey: "2024-09", // Limits the query to a specific partition key. Default: undefined
    };

    const { resources, diagnostics } = await containers.container.items
        .query({
            query: latestDocumentQuery,
            parameters: [{ name: "@Repository", value: repository }]
        }, options)
        .fetchAll();    // https://learn.microsoft.com/en-us/javascript/api/@azure/cosmos/queryiterator?view=azure-node-latest#@azure-cosmos-queryiterator-fetchall
    if (resources?.length === 1) {
        return resources[0];
    }
    else
    {
        context.error(`${JSON.stringify(diagnostics)}`);
        return undefined;
    }
}