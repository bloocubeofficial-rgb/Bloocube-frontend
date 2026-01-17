#!/usr/bin/env bash
set -euo pipefail

# Load config
if [ -f .build ]; then
  . ./.build
fi

if [ -z "${PROJECT_ID:-}" ] || [ -z "${SERVICE:-}" ]; then
  echo "Please set PROJECT_ID and SERVICE in .build"
  exit 1
fi

gcloud config set project "$PROJECT_ID"

# Build & push image
IMAGE_TAG=${IMAGE:-gcr.io/$PROJECT_ID/$SERVICE:$(date +%Y%m%d-%H%M%S)}

echo "Building $IMAGE_TAG"

docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api-backend.Bloocube.com \
  --build-arg NEXT_PUBLIC_AI_VIDEO_GEN_URL=https://ai-video.bloocube.com \
  -t "$IMAGE_TAG" .

echo "Pushing $IMAGE_TAG"

docker push "$IMAGE_TAG"

# Deploy to Cloud Run
sed "s#IMAGE_URL#$IMAGE_TAG#" cloudrun.yaml > /tmp/cr-fe.yaml

gcloud run services replace /tmp/cr-fe.yaml \
  --region "${REGION:-us-central1}" \
  --platform managed

echo "Deployed $SERVICE to Cloud Run"
