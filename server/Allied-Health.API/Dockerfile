# Use the official .NET runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy the main API project file
COPY ["Allied-Health.API/Allied-Health.API.csproj", "Allied-Health.API/"]

# Copy other project files if they're referenced
COPY ["AlliedHealth.Common/AlliedHealth.Common.csproj", "AlliedHealth.Common/"]
COPY ["AlliedHealth.Model/AlliedHealth.Model.csproj", "AlliedHealth.Model/"]
COPY ["AlliedHealth.Service/AlliedHealth.Service.csproj", "AlliedHealth.Service/"]

# Restore dependencies
RUN dotnet restore "Allied-Health.API/Allied-Health.API.csproj"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/Allied-Health.API"
RUN dotnet build "Allied-Health.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Allied-Health.API.csproj" -c Release -o /app/publish

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Allied-Health.API.dll"]