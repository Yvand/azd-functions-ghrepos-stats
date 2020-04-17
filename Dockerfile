# Copy source from repo to container to build it
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:12 AS build-env
COPY . /src/azfunc-repository-stats
RUN cd /src/azfunc-repository-stats && \
    rm -rf node_modules/ && \
    npm install && \
    npm run build --if-present && \
    npm run test --if-present

# To enable ssh & remote debugging on app service change the base image to the one below
# FROM mcr.microsoft.com/azure-functions/node:3.0-appservice
FROM mcr.microsoft.com/azure-functions/node:3.0

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

COPY --from=build-env ["/src/azfunc-repository-stats", "/home/site/wwwroot"]

# Copy all files but install only production dependencies (so typescript is not installed)
RUN cd /home/site/wwwroot && \
    rm -rf node_modules/ && \
    npm install --production

EXPOSE 80
