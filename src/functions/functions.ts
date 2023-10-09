import { app, HttpRequest, HttpResponseInit, InvocationContext, output, Timer } from "@azure/functions";
import { GetRelease, GetReleases } from "../app/gitHubApi";
import { RefreshStatistics } from "../app/gitHubRepository";
import { RepositoryDataDocument, Settings } from "../app/common";
import { GetLatestDocument } from "../app/cosmosData";

const cosmosOutput = output.cosmosDB({
  connection: "CosmosConnection",
  databaseName: Settings.CosmosDatabaseId || "<Could not read app setting CosmosDatabaseId>",
  containerName: Settings.CosmosCollectionId || "<Could not read app setting CosmosCollectionId>",
  // containerName: "Container1",
  // createIfNotExists: true,
  // partitionKey: "/DateStatCreatedYYYYMM",
});

const projectsConfig: string[] | undefined = Settings.Repositories?.split(";");

export async function GetLatestData(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (!projectsConfig) {
    console.error("Could not read app setting 'Repositories'");
    return { status: 500, body: "an internal error has occurred." };
  }
  const projectConfig = projectsConfig.find(x => x.toUpperCase().startsWith("Yvand/EntraCP".toUpperCase()));
  if (projectConfig) {
    //   this.mainAssetName = projectConfig.split(",")[1].toUpperCase();
    //   this.additionalDownloadCount = Number(projectConfig.split(",")[2]);
  }

  const document: RepositoryDataDocument = await RefreshStatistics("Yvand/EntraCP", "AzureCP.wsp", 1000);
  const stringifiedDocument = JSON.stringify(document);

  return { body: stringifiedDocument };
};

export async function RefreshData(myTimer: Timer, context: InvocationContext): Promise<RepositoryDataDocument[] | undefined> {
  if (!projectsConfig) {
    console.error("Could not read app setting 'Repositories'");
    return;
  }

  let documentsOutput: Array<RepositoryDataDocument> = [];
  await Promise.all(projectsConfig.map(async projectConfig => {
    if (projectConfig.split(",")?.length !== 3) {
      console.error(`App setting 'Repositories' does not have the expected format: '${projectConfig}'`);
      return undefined;
    }

    const projectName: string = projectConfig.split(",")[0];
    const mainAssetName: string = projectConfig.split(",")[1];
    const additionalDownloadCount: number = Number(projectConfig.split(",")[2]);

    context.log(`[${projectName}] Getting data...`);
    let promises: Promise<RepositoryDataDocument>[] = new Array(2);
    promises[0] = RefreshStatistics(projectName, mainAssetName, additionalDownloadCount); // Query GitHub
    promises[1] = GetLatestDocument(projectName); // Query CosmosDB
    const [FreshGithubData, latestCosmosDocument] = await Promise.all(promises);

    if (FreshGithubData === undefined) {
      context.error(`[${projectName}] Could not get fresh data from GitHub, skip project.`);
      return;
    }

    if (latestCosmosDocument === undefined) {
      context.warn(`[${projectName}] Could not get latest document from CosmosDB, add latest CosmosDB document to output.`);
      documentsOutput.push(FreshGithubData);
    } else if (FreshGithubData.LatestReleaseDownloadCount !== latestCosmosDocument.LatestReleaseDownloadCount) {
      context.log(`[${projectName}] Adding a document to Cosmos DB because CosmosDB.LatestReleaseDownloadCount has ${latestCosmosDocument.LatestReleaseDownloadCount} and GitHub.LatestReleaseDownloadCount has ${FreshGithubData.LatestReleaseDownloadCount}...`);
      documentsOutput.push(FreshGithubData);
    } else {
      context.log(`[${projectName}] CosmosDB.LatestReleaseDownloadCount has ${latestCosmosDocument.LatestReleaseDownloadCount} and is up to date`);
    }
  }));

  // return undefined;
  return documentsOutput;
}

app.http('GetLatestData', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: GetLatestData
});

app.timer('RefreshData', {
  schedule: Settings.FuncRefreshDataSchedule,
  runOnStartup: false,
  handler: RefreshData,
  return: cosmosOutput
});