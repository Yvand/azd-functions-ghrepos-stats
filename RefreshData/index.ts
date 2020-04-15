import { AzureFunction, Context } from "@azure/functions"
import * as Config from "../app/config";
import { RepositoryData } from "../app/refreshData";
import { getLatestDocument } from "../app/latestData";
const { performance } = require('perf_hooks');

const repositoriesConfig: string[] = Config.repositories.split(";");
const repositoryNames: string[] = repositoriesConfig.map(x => x.split(",")[0]);
const repositories: RepositoryData[] = repositoryNames.map(x => new RepositoryData(x) )

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    context.log('Timer function RefreshData started');
    const startTime = performance.now;
    await processRepositories(context, myTimer);
    const endTime = performance.now;
    context.log(`Timer function RefreshData completed in ${endTime() - startTime()} milliseconds.`);
};

const processRepositories: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    await Promise.all(repositories.map(async repository => {
        context.log(`[${repository.fullName}] Processing repository...`);

        let promises: Promise<Config.RepositoryDataDocument>[] = new Array(2);
        promises[0] = repository.getFreshData();
        promises[1] = getLatestDocument(repository.fullName);
        const [freshData, latestCosmosDocument] = await Promise.all(promises);
        let outputDocument = undefined;

        context.log(`[${repository.fullName}] LatestReleaseDownloadCount in GitHub: ${freshData?.LatestReleaseDownloadCount}, LatestReleaseDownloadCount in CosmosDB: ${latestCosmosDocument?.LatestReleaseDownloadCount}`);
        if (!latestCosmosDocument) {
            context.log(`[${repository.fullName}] Adding a new document in Cosmos DB because none was found...`);
            outputDocument = freshData;
        } else if (freshData.LatestReleaseDownloadCount !== latestCosmosDocument.LatestReleaseDownloadCount) {
            context.log(`[${repository.fullName}] Adding a new document in Cosmos DB because previous one is outdated...`);
            outputDocument = freshData;
        }
        
        if (outputDocument) {
            context.log(`[${repository.fullName}] Adding a new document in Cosmos DB...`);
            context.bindings.outputDocument = outputDocument;
        } else {
            context.log(`[${repository.fullName}] Not adding a document to Cosmos DB.`);
        }
    }));
}

async function asyncForEach(array: any, callback: any) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

export default timerTrigger;
