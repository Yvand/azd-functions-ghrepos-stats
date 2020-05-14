import * as Config from "../config";
import 'cross-fetch/polyfill';
import ApolloClient, { gql, DocumentNode, StoreReader } from 'apollo-boost';
import { RepositoryData_repository_releases } from "../graphql_types/RepositoryData";
import { IRepository } from "./IRepository"

const apolloClient: ApolloClient<unknown> = new ApolloClient({
  uri: Config.github_graphql_uri,
  request: operation => {
    operation.setContext({
      headers: {
        authorization: `Bearer ${Config.github_token}`,
      },
    });
  },
});

/** Return fresh data from GitHub */
class GitHubRepository implements IRepository {
  readonly fullName: string; // readonly: only be modifiable when an object is first created - https://www.typescriptlang.org/docs/handbook/interfaces.html#readonly-properties
  private name: string;
  private owner: string;
  private additionalDownloadCount: number = 0;
  private mainAssetName: string | undefined;

  /**
   *
   */
  constructor(repository: string) {
    this.fullName = repository;
    this.name = repository.split("/")[1];
    this.owner = repository.split("/")[0];

    const projectsConfig: string[] = Config.repositories.split(";");
    const projectConfig = projectsConfig.find(x => x.toUpperCase().startsWith(repository.toUpperCase()));
    if (projectConfig) {
      this.mainAssetName = projectConfig.split(",")[1].toUpperCase();
      this.additionalDownloadCount = Number(projectConfig.split(",")[2]);
    }
  }

  /**
   * 
   */
  async getFreshData(): Promise<Config.RepositoryDataDocument> {
    const now = new Date();
    const yyyyMMRegex: string = "^\\d\\d\\d\\d-\\d\\d";
    const yyyyMMArray = now.toISOString().match(yyyyMMRegex)
    let latestDataDocument: Config.RepositoryDataDocument = {
      DateStatCreated: now.toUTCString(),                                  // Use RFC1123 date time format: https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings#the-rfc1123-r-r-format-specifier
      DateStatCreatedSortable: now.toISOString(),                          // Use sortable date time format: https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings#the-sortable-s-format-specifier
      DateStatCreatedYYYYMM: yyyyMMArray ? yyyyMMArray[0] : "",            // Used as the partition key
      DateStatCreatedTicks: (now.getTime() * 10000) + 621355968000000000,  // Converted to ticks as documented in https://stackoverflow.com/questions/7966559/how-to-convert-javascript-date-object-to-ticks
      Repository: this.fullName
    };
    const variables = {
      "name": this.name,
      "owner": this.owner
    };

    try {
      const result = await apolloClient.query({
          query: Config.queryRepositoryData,
          variables: variables
      });
      let totalReleasesDownloadCount: number = 0;
      let isLatestRelease: boolean = true;      
      const releases = result.data.repository.releases as RepositoryData_repository_releases;
      if (!releases || !releases.nodes) {
        return latestDataDocument;
      }

      releases.nodes.forEach ((release) => {
        // Below is shorthand of: if (release != undefined && release.isDraft === true && release.isPrerelease === true)
        if (release?.isDraft || release?.isPrerelease) {
          return;
        }
        release?.releaseAssets.nodes?.forEach((asset) => {
          totalReleasesDownloadCount += asset!.downloadCount;

          if (asset?.name.toUpperCase() === this.mainAssetName && isLatestRelease) {
            latestDataDocument.LatestAssetUrl = asset?.downloadUrl;
          }
        })
        if (isLatestRelease) {
          latestDataDocument.LatestReleaseCreationDate = release?.publishedAt;
          latestDataDocument.LatestReleaseTagName = release?.tagName;
          latestDataDocument.LatestReleaseDownloadCount = totalReleasesDownloadCount;
          isLatestRelease = false;
        }
        latestDataDocument.AllReleasesDownloadCount = totalReleasesDownloadCount;
        latestDataDocument.TotalDownloadCount = totalReleasesDownloadCount + (this.additionalDownloadCount || 0);
      })
    } catch (error) {
        console.error(error);
    }
    return latestDataDocument;    
  }
}

export {GitHubRepository};

//const axios = require('axios').default;
// const v3jsonQuery = async function (projectName: string): Promise<void> {
//     try {
//         // https://stackoverflow.com/questions/18995854/how-can-i-use-github-api-to-get-all-tags-or-releases-for-a-project
//         const latestRelease = await axios.get(`https://api.github.com/repos/${projectName}/releases/latest`);
//         console.log(latestRelease);
//     } catch (error) {
//         console.error(error);
//     }

//     // https://developer.github.com/v4/object/tag/
//     // https://stackoverflow.com/questions/40792344/does-apollo-client-work-on-node-js
//     // https://stackoverflow.com/questions/57441665/can-make-graphql-query-to-be-strongly-types-with-typescript

//     // Generate schema from query: https://medium.com/open-graphql/automatically-generate-typescript-definitions-for-graphql-queries-with-apollo-codegen-e73eae72b561
//     // https://github.com/quicktype/graphql-samples
// }

//     const parameters = `variables = {
//         "name": "LDAPCP",
//         "owner": "Yvand"
//     }
//     `
//     const fullQuery = query + parameters;
//     console.log(fullQuery);
//     const githubUrl = 'https://api.github.com/graphql'
//     const token = Config.github_token;
//     const oauth = {Authorization: 'bearer ' + token};
//     try {
//         // https://stackoverflow.com/questions/18995854/how-can-i-use-github-api-to-get-all-tags-or-releases-for-a-project
//         // https://www.robinwieruch.de/graphql-apollo-client-tutorial
//         const result = await axios.post(githubUrl, {query: fullQuery}, {headers: oauth});
//         console.log(result.data);
//     } catch (error) {
//         console.error(error);
//     }
// }