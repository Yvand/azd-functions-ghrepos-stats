import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { GetRelease, GetReleases } from "../app/gitHubApi";
import { RefreshStatistics } from "../app/gitHubRepository";
import { RepositoryDataDocument, Settings } from "../app/common";

export async function GetLatestDocument(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

app.http('GetLatestDocument', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: GetLatestDocument
});
