/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: RepositoryData
// ====================================================

export interface RepositoryData_repository_releases_nodes_author {
  __typename: "User";
  id: string;
}

export interface RepositoryData_repository_releases_nodes_releaseAssets_nodes {
  __typename: "ReleaseAsset";
  /**
   * The number of times this asset was downloaded
   */
  downloadCount: number;
  /**
   * Identifies the URL where you can download the release asset via the browser.
   */
  downloadUrl: any;
  /**
   * Identifies the title of the release asset.
   */
  name: string;
}

export interface RepositoryData_repository_releases_nodes_releaseAssets {
  __typename: "ReleaseAssetConnection";
  /**
   * A list of nodes.
   */
  nodes: (RepositoryData_repository_releases_nodes_releaseAssets_nodes | null)[] | null;
}

export interface RepositoryData_repository_releases_nodes {
  __typename: "Release";
  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any;
  /**
   * The name of the release's Git tag
   */
  tagName: string;
  /**
   * Whether or not the release is a draft
   */
  isDraft: boolean;
  /**
   * Whether or not the release is a prerelease
   */
  isPrerelease: boolean;
  /**
   * The title of the release.
   */
  name: string | null;
  /**
   * The author of the release
   */
  author: RepositoryData_repository_releases_nodes_author | null;
  /**
   * Identifies the date and time when the release was created.
   */
  publishedAt: any | null;
  /**
   * The HTTP URL for this issue
   */
  url: any;
  /**
   * List of releases assets which are dependent on this release.
   */
  releaseAssets: RepositoryData_repository_releases_nodes_releaseAssets;
}

export interface RepositoryData_repository_releases {
  __typename: "ReleaseConnection";
  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number;
  /**
   * A list of nodes.
   */
  nodes: (RepositoryData_repository_releases_nodes | null)[] | null;
}

export interface RepositoryData_repository {
  __typename: "Repository";
  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any;
  /**
   * List of releases which are dependent on this repository.
   */
  releases: RepositoryData_repository_releases;
}

export interface RepositoryData {
  /**
   * Lookup a given repository by the owner and repository name.
   */
  repository: RepositoryData_repository | null;
}

export interface RepositoryDataVariables {
  name: string;
  owner: string;
}
