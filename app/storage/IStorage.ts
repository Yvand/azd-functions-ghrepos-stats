import * as Config from "../config";

export interface IStorage {
    getLatestDocument: () => Promise<Config.RepositoryDataDocument>;
}