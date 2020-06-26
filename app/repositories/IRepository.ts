import * as Config from "../config";

export interface IRepository {
    fullName: string;
    getFreshData: () => Promise<Config.RepositoryDataDocument>;
}