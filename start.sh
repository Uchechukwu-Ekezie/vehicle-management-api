#!/usr/bin/env bash
set -euo pipefail

# Railpack fallback start script
# Changes directory into the VehicleManagementAPI project, publishes, and runs the app
# Binds to the port provided by Railway via $PORT

echo "Starting Railpack fallback script..."

cd VehicleManagementAPI

# Ensure environment variables
export ASPNETCORE_URLS="http://0.0.0.0:${PORT:-8080}"
export ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT:-Production}

echo "Restoring and publishing the app..."
dotnet restore
DOTNET_PROJECT="VehicleManagementAPI.csproj"
dotnet publish "$DOTNET_PROJECT" -c Release -o out

echo "Starting the published app..."
exec dotnet out/VehicleManagementAPI.dll
