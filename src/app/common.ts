import * as process from "process";

const connectionSplitted: string[] | undefined = process.env.CosmosConnection?.split(";");
export const Settings = {
    Repositories: process.env.Repositories,
    CosmosConnection: process.env.CosmosConnection,
    CosmosDatabaseId: process.env.CosmosDatabaseId,
    CosmosCollectionId: process.env.CosmosCollectionId,
    CosmosEndpoint: connectionSplitted ? connectionSplitted[0].substring("AccountEndpoint=".length) : "https://host.docker.internal:8081/",
    CosmosKey: connectionSplitted ? connectionSplitted[1].substring("AccountKey=".length) : "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==",
    FuncRefreshDataSchedule: process.env.FuncRefreshDataSchedule ? process.env.FuncRefreshDataSchedule : "0 */30 * * * *",
}

export declare type RepositoryDataDocument = { 
    id: string,
    DateStatCreated: string,
    DateStatCreatedSortable: string,
    DateStatCreatedYYYYMM: string, 
    DateStatCreatedTicks: number,
    Repository: string,
    LatestAssetUrl?: string,
    LatestReleaseCreationDate?: string,
    LatestReleaseTagName?: string,
    LatestAssetDownloadCount?: string,
    TotalAssetsDownloadCount?: string,
    LatestReleaseDownloadCount: number,
    AllReleasesDownloadCount?: number,
    TotalDownloadCount?: number,
    ReleasesCount?: number,
};

// This method awaits on async calls and catches the exception if there is any - https://dev.to/sobiodarlington/better-error-handling-with-async-await-2e5m
export const safeWait = (promise: Promise<any>) => {
    return promise
        .then(data => ([data, undefined]))
        .catch(error => Promise.resolve([undefined, error]));
}
