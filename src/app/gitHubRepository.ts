import { GetRelease, GetReleases } from "./gitHubApi";
import { RepositoryDataDocument } from "./common";
const { v4: uuidv4 } = require('uuid');

/**
 * Query GitHub to get the latest repository data
 */
export async function GetLatestDataFromGitHub(repository: string, mainAssetName: string, additionalDownloadCount: number = 0): Promise<RepositoryDataDocument> {
  const now = new Date();
  const yyyyMMRegex: string = "^\\d\\d\\d\\d-\\d\\d";
  const yyyyMMArray = now.toISOString().match(yyyyMMRegex)
  let latestDataDocument: RepositoryDataDocument = {
    id: uuidv4(),
    DateStatCreated: now.toUTCString(),                                   // Use RFC1123 date time format: https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings#the-rfc1123-r-r-format-specifier
    DateStatCreatedSortable: now.toISOString(),                           // Use sortable date time format: https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings#the-sortable-s-format-specifier
    DateStatCreatedYYYYMM: yyyyMMArray ? yyyyMMArray[0] : "",             // Used as the partition key
    DateStatCreatedTicks: (now.getTime() * 10000) + 621355968000000000,   // Converted to ticks as documented in https://stackoverflow.com/questions/7966559/how-to-convert-javascript-date-object-to-ticks
    Repository: repository,
    LatestReleaseDownloadCount: 0
  };

  let totalReleasesDownloadCount: number = 0;
  const latestRelease = await GetRelease(repository, "latest");
  const latestReleaseId: number = latestRelease.id;

  const releases = await GetReleases(repository);
  latestDataDocument.ReleasesCount = releases.length;
  releases.forEach(async release => {
    if (release.draft === true || release.prerelease === true) {
      return;
    }

    release.assets.forEach(async (asset: {
      browser_download_url: string; name: string; download_count: number;
    }) => {
      totalReleasesDownloadCount += asset.download_count;

      if (release.id === latestReleaseId) {
        latestDataDocument.LatestReleaseDownloadCount += asset.download_count;
        if (asset.name.toUpperCase() === mainAssetName.toUpperCase()) {
          latestDataDocument.LatestAssetUrl = asset.browser_download_url;
        }
      }
    });
    if (release.id === latestReleaseId) {
      latestDataDocument.LatestReleaseCreationDate = release.published_at;
      latestDataDocument.LatestReleaseTagName = release.tag_name;
    }

    latestDataDocument.AllReleasesDownloadCount = totalReleasesDownloadCount;
    latestDataDocument.TotalDownloadCount = totalReleasesDownloadCount + additionalDownloadCount;
  });

  return latestDataDocument;
}
