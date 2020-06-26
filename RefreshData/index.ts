import { AzureFunction, Context } from "@azure/functions"
import * as Config from "../app/config";
import { IRepository } from "../app/repositories/IRepository"
import { GitHubRepository } from "../app/repositories/gitHubRepository";
import { getLatestCosmosDocument } from "../app/storage/cosmosdbStorage";
const { performance } = require('perf_hooks');

const repositoriesConfig: string[] = Config.repositories.split(";");
const repositoryNames: string[] = repositoriesConfig.map(x => x.split(",")[0]);
const repositories: IRepository[] = repositoryNames.map(x => new GitHubRepository(x))

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    //const startTime = performance.now;
    await processRepositories(context, myTimer);
    // const endTime = performance.now;
    // context.log(`Timer function RefreshData completed in ${endTime() - startTime()} milliseconds.`);
};

const processRepositories: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    await Promise.all(repositories.map(async repository => {
        context.log(`[${repository.fullName}] Processing repository...`);

        let promises: Promise<Config.RepositoryDataDocument>[] = new Array(2);
        promises[0] = repository.getFreshData();
        promises[1] = getLatestCosmosDocument(repository.fullName);
        const [freshData, latestCosmosDocument] = await Promise.all(promises);

        context.log(`[${repository.fullName}] LatestReleaseDownloadCount in GitHub: ${freshData?.LatestReleaseDownloadCount}, LatestReleaseDownloadCount in CosmosDB: ${latestCosmosDocument?.LatestReleaseDownloadCount}`);
        let addFreshDocument = false;
        if (!latestCosmosDocument) {
            context.log(`[${repository.fullName}] Adding a document to Cosmos DB because none was found...`);
            addFreshDocument = true;
        } else if (freshData.LatestReleaseDownloadCount !== latestCosmosDocument.LatestReleaseDownloadCount) {
            context.log(`[${repository.fullName}] Adding a document to Cosmos DB because it is outdated...`);
            addFreshDocument = true;
        }
        
        if (addFreshDocument) {
            //context.log(`[${repository.fullName}] Adding a document in Cosmos DB...`);
            context.bindings.outputDocument = freshData;
        } else {
            context.log(`[${repository.fullName}] No document added to Cosmos DB.`);
        }
    }));
}

export default timerTrigger;
