const process = require('process'); // https://nodejs.org/api/process.html
import { gql, DocumentNode } from 'apollo-boost';

const connectionSplitted: string = process.env.COSMOS_CONNECTION?.split(";")
export const endpoint: string = connectionSplitted ? connectionSplitted[0].substring("AccountEndpoint=".length) : "https://host.docker.internal:8081/";
export const key: string = connectionSplitted ? connectionSplitted[1].substring("AccountKey=".length) : "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";

if (endpoint.includes("https://host.docker.internal")) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Deactivate certificate validation
}
export const database: string = process.env.COSMOS_DATABASEID || "";
export const container = process.env.COSMOS_COLLECTIONID || "";
export const latestDocumentQuery: string = "SELECT TOP 1 c.DateStatCreated, c.Repository, c.LatestAssetUrl, c.LatestReleaseCreationDate, c.LatestReleaseTagName, c.LatestReleaseDownloadCount, c.AllReleasesDownloadCount, c.TotalDownloadCount FROM c WHERE c.Repository = @Repository ORDER BY c.DateStatCreatedTicks DESC";

export const github_token = process.env.GITHUB_TOKEN
export const github_graphql_uri = "https://api.github.com/graphql"
export const repositories = process.env.REPOSITORIES

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
  LatestReleaseDownloadCount?: number,
  AllReleasesDownloadCount?: number,
  TotalDownloadCount?: number
};

export const queryRepositoryData: DocumentNode = gql `
  query RepositoryData($name: String!, $owner: String!) {
    repository(name: $name, owner: $owner) {
      createdAt
      releases(orderBy: {field: CREATED_AT, direction: DESC}, first: 100) {
        totalCount
        nodes {
          createdAt
          tagName
          isDraft
          isPrerelease
          name
          author {
            id
          }
          publishedAt
          url
          releaseAssets(first: 100) {
            nodes {
              downloadCount
              downloadUrl
              name
            }
          }
        }
      }
    }
  }  
`;
