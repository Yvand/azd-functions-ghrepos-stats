import { app, HttpRequest, HttpResponseInit, InvocationContext, output, Timer } from "@azure/functions";
import { GetRelease, GetReleases } from "../app/gitHubApi";
import { RefreshStatistics } from "../app/gitHubRepository";
import { RepositoryDataDocument, Settings } from "../app/common";
import { GetLatestDocument } from "../app/cosmosData";

const cosmosOutput = output.cosmosDB({
  connection: "CosmosConnection",
  databaseName: Settings.CosmosDatabaseId || "",
  // containerName: Settings.CosmosCollectionId || "",
  containerName: "Container1",
  createIfNotExists: true,
  partitionKey: "/DateStatCreatedYYYYMM",
});

export async function GetLatestData(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const name = request.query.get('name') || await request.text() || 'world';

  const projectsConfig: string[] | undefined = Settings.Repositories?.split(";");
  if (!projectsConfig) {
    throw "Could not read app setting 'Repositories'";
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

  context.log(`calling GetLatestDocument with param '${projectName}'`);
  const latestCosmosDocument: RepositoryDataDocument = await GetLatestDocument(projectName);
  context.log(`latestCosmosDocument: ${JSON.stringify(latestCosmosDocument)}`);

  const newDocument: RepositoryDataDocument = await RefreshStatistics(projectName, mainAssetName, additionalDownloadCount);
  context.log(`newDocument: ${JSON.stringify(newDocument)}`);
  return undefined;
  return newDocument;
}

app.http('GetLatestData', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: GetLatestData
});

app.timer('RefreshData', {
  schedule: "0 */1 * * * *",
  runOnStartup: false,
  handler: RefreshData,
  return: cosmosOutput
});