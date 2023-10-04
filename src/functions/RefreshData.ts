import { app, InvocationContext, Timer, output } from "@azure/functions";
import { Settings } from "../app/common";

const cosmosOutput = output.cosmosDB({
    connectionStringSetting: Settings.COSMOS_CONNECTION || "",
    databaseName: Settings.COSMOS_DATABASEID || "",
    collectionName: Settings.COSMOS_COLLECTIONID || "",
    createIfNotExists: true,
});

export async function RefreshData(myTimer: Timer, context: InvocationContext): Promise<any> {
    context.log('Timer function processed request.');
    return {
        id: ``,
        name: "",
        employeeId: "",
        address: "",
    };
}

// app.timer('RefreshData', {
//     schedule: "0 */30 * * * *",
//     runOnStartup: false,
//     handler: RefreshData,
//     return: cosmosOutput
// });
