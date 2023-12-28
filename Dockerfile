
### Build dotnet application
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS dotnet-build-env
WORKDIR /Backend

# Copy everything
COPY /RubixCubeBackend/RubixCubeBackend ./
# Restore as distinct layers
RUN dotnet restore
# Build and publish a release
RUN dotnet publish -c Release -o out


### Build frontend
FROM node:19-bullseye AS vue-build-env
WORKDIR /Frontend 

COPY /rubix-cube ./

RUN npm install

RUN npm run build


### Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /App
COPY --from=dotnet-build-env /Backend/out .
COPY --from=vue-build-env /Frontend/dist ./Frontend

# install runtime dependencies
RUN apt-get update && apt-get install -y apt-utils

EXPOSE 80

ENTRYPOINT ["dotnet", "RubixCubeBackend.dll"]

