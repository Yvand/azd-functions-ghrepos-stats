import * as process from "process";

export const Settings = {
    Repositories: process.env.REPOSITORIES,
    COSMOS_CONNECTION: process.env.COSMOS_CONNECTION,
    COSMOS_DATABASEID: process.env.COSMOS_DATABASEID,
    COSMOS_COLLECTIONID: process.env.COSMOS_COLLECTIONID,
}

// This method awaits on async calls and catches the exception if there is any - https://dev.to/sobiodarlington/better-error-handling-with-async-await-2e5m
export const safeWait = (promise: Promise<any>) => {
    return promise
        .then(data => ([data, undefined]))
        .catch(error => Promise.resolve([undefined, error]));
}

export declare type RepositoryDataDocument = { 
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
