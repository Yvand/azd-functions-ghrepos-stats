async function DoGetQuery(url: string): Promise<any> {
    const response = await fetch(url, {
        method: "GET",
        headers: { "Accept" : "application/json" }
    });
    const responseJson = await response.json();
    return responseJson;
}

export async function GetReleases(repository: string): Promise<any[]> {
    // doc: https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28
    // TODO: use pagination to get all releases
    return await DoGetQuery(`https://api.github.com/repos/${repository}/releases?per_page=100`);
}

export async function GetRelease(repository: string, releaseId: string): Promise<any> {
    // doc: https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-a-release
    return await DoGetQuery(`https://api.github.com/repos/${repository}/releases/${releaseId}`);
}