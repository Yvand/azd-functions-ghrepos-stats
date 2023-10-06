import { app, InvocationContext, Timer, output } from "@azure/functions";
import { RepositoryDataDocument, Settings } from "../app/common";
import { RefreshStatistics } from "../app/gitHubRepository";

const cosmosOutput = output.cosmosDB({
    connection: "CosmosConnection",
    databaseName: Settings.CosmosDatabaseId || "",
    containerName: Settings.CosmosCollectionId || "",
    // containerName: "Container1",
    // createIfNotExists: true,
    // partitionKey: "/DateStatCreatedYYYYMM",
});

export async function RefreshData(myTimer: Timer, context: InvocationContext): Promise<RepositoryDataDocument | undefined> {
    context.log('Timer function processed request.');

    const projectsConfig: string[] | undefined = Settings.Repositories?.split(";");
    if (!projectsConfig) {
        throw "Could not read app setting 'Repositories'";
    }

    const projectConfig = projectsConfig.find(x => x.toUpperCase().startsWith("Yvand/EntraCP".toUpperCase()));
    if (!projectConfig) {
        return undefined;
    }

    if (projectConfig.split(",")?.length !== 3) {
        throw "App setting 'Repositories' does not have the expected format";
    }
    const projectName: string = projectConfig.split(",")[0];
    const mainAssetName: string = projectConfig.split(",")[1];
    const additionalDownloadCount: number = Number(projectConfig.split(",")[2]);
    const document: RepositoryDataDocument = await RefreshStatistics(projectName, mainAssetName, additionalDownloadCount);
    return document;
}

app.timer('RefreshData', {
    schedule: "0 */1 * * * *",
    runOnStartup: false,
    handler: RefreshData,
    return: cosmosOutput
});
