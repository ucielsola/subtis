#!/bin/bash

# File to check
ENV_FILE=".env.development"

# Directories to copy the .env.development file to
TARGET_DIRS=(
  "packages/api"
  "packages/cli"
  "packages/db"
  "packages/indexer"
  "packages/shared"
  "packages/stremio"
  "packages/web"
)

# Required variables
REQUIRED_VARS=(
  "SUPABASE_API_KEY"
  "SUPABASE_BASE_URL"
  "OPEN_SUBTITLES_API_KEY"
  "SUBDL_API_KEY"
  "YOUTUBE_API_KEY"
  "SPOTIFY_CLIENT_ID"
  "SPOTIFY_CLIENT_SECRET"
  "TMDB_API_KEY"
  "RESEND_API_KEY"
  "CLOUDFLARE_API_TOKEN"
  "CLOUDFLARE_ZONE_ID"
  "PUBLIC_API_BASE_URL_DEVELOPMENT"
  "PUBLIC_API_BASE_URL_PRODUCTION"
  "PUBLIC_WEBSOCKET_BASE_URL_DEVELOPMENT"
  "PUBLIC_WEBSOCKET_BASE_URL_PRODUCTION"
  "OPEN_PANEL_CLIENT_ID"
  "OPEN_PANEL_CLIENT_SECRET"
)

# Check if the .env.development file exists
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE does not exist."
  exit 1
fi

# Check that required environment variables have values
missing_vars=0
for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -qE "^$var=[^ ]+" "$ENV_FILE"; then
    echo "Warning: $var is not set or has no value."
    missing_vars=1
  fi
done

# Exit if any variables are missing or empty
if [[ $missing_vars -eq 1 ]]; then
  echo "Please ensure all required environment variables are set."
  exit 1
fi

# Copy the .env.development file to target directories
for dir in "${TARGET_DIRS[@]}"; do
  if [[ -d "$dir" ]]; then
    if [[ "$dir" == "packages/api" ]]; then
      cp "$ENV_FILE" "$dir/.dev.vars"
      echo "Copied $ENV_FILE to $dir/.dev.vars"
    else
      cp "$ENV_FILE" "$dir/.env.development"
      echo "Copied $ENV_FILE to $dir"
    fi
  else
    echo "Warning: Directory $dir does not exist. Skipping."
  fi
done

echo "All done!"
