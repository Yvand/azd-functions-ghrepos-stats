import * as process from "process";

export const Settings = {
    Repositories: process.env.Repositories,
    CosmosConnection: process.env.CosmosConnection,
    CosmosDatabaseId: process.env.CosmosDatabaseId,
    CosmosCollectionId: process.env.CosmosCollectionId,
}

// This method awaits on async calls and catches the exception if there is any - https://dev.to/sobiodarlington/better-error-handling-with-async-await-2e5m
export const safeWait = (promise: Promise<any>) => {
    return promise
        .then(data => ([data, undefined]))
        .catch(error => Promise.resolve([undefined, error]));
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
