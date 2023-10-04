import { GetRelease, GetReleases } from "./gitHubApi";
import { RepositoryDataDocument } from "./common";

  /**
   * 
   */
  export async function RefreshStatistics(repository: string, mainAssetName: string, additionalDownloadCount: number = 0): Promise<RepositoryDataDocument> {
    const now = new Date();
    const yyyyMMRegex: string = "^\\d\\d\\d\\d-\\d\\d";
    const yyyyMMArray = now.toISOString().match(yyyyMMRegex)
    let latestDataDocument: RepositoryDataDocument = {
      DateStatCreated: now.toUTCString(),
      DateStatCreatedSortable: now.toISOString(),
      DateStatCreatedYYYYMM: yyyyMMArray ? yyyyMMArray[0] : "",
      DateStatCreatedTicks: (now.getTime() * 10000) + 621355968000000000,
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
          if (asset.name.toUpperCase() === mainAssetName) {
            latestDataDocument.LatestAssetUrl = asset.browser_download_url;
          }
        }
      });
      if (release.id === latestReleaseId) {
        latestDataDocument.LatestReleaseCreationDate = release.publishedAt;
        latestDataDocument.LatestReleaseTagName = release.tagName;
      }

      latestDataDocument.AllReleasesDownloadCount = totalReleasesDownloadCount;
      latestDataDocument.TotalDownloadCount = totalReleasesDownloadCount + additionalDownloadCount;
    });

    return latestDataDocument;
  }
