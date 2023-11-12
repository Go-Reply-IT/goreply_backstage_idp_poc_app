#!/bin/bash

PROJECT_NAME="goreply-playground-idp"
SECRETS=("auth_github_client_id" "auth_github_client_secret" "github_token" "atlassian_api_token")

for SECRET_KEY in "${SECRETS[@]}"; do
  SECRET_VALUE=$(gcloud secrets versions access latest --secret=${SECRET_KEY} --project=${PROJECT_NAME})
  UPPER_SECRET_KEY=$(echo "${SECRET_KEY}" | tr '[:lower:]' '[:upper:]')
  export "${UPPER_SECRET_KEY}=${SECRET_VALUE}"
done