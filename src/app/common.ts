import * as process from "process";

const ConnectionPrefix = process.env.ConnectionPrefix || "CosmosOutputBinding";
export const Settings = {
    Repositories: process.env.Repositories,
    ConnectionPrefix: ConnectionPrefix,
    CosmosDatabaseId: process.env.CosmosDatabaseId || "",
    CosmosCollectionId: process.env.CosmosCollectionId,
    CosmosEndpoint: process.env[`${ConnectionPrefix}__accountEndpoint`] || "",
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
