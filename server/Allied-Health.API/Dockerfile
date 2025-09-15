# Use the official .NET runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy everything
COPY . .

# Restore dependencies for the main API project
RUN dotnet restore "Allied-Health.API/AlliedHealth.API/AlliedHealth.API.csproj"

# Build the application
RUN dotnet build "Allied-Health.API/AlliedHealth.API/AlliedHealth.API.csproj" -c Release -o /app/build

# Publish the application
RUN dotnet publish "Allied-Health.API/AlliedHealth.API/AlliedHealth.API.csproj" -c Release -o /app/publish

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AlliedHealth.API.dll"]