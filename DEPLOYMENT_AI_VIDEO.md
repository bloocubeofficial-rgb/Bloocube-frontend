# AI Video Generator Deployment Guide

## Problem
`NEXT_PUBLIC_*` environment variables in Next.js are embedded at **BUILD TIME**, not runtime. Setting them in Cloud Run environment variables won't work because the build has already happened.

## Solution
The AI Video Generator URL must be passed as a **build argument** during the Docker build process.

## Deployment Steps

### Option 1: Using Cloud Build with Substitution Variables (Recommended)

1. **Trigger the build with the substitution variable:**
   ```bash
   gcloud builds submit \
     --config=Bloocube-frontend/cloudbuild.yaml \
     --substitutions=_NEXT_PUBLIC_AI_VIDEO_GEN_URL=https://your-deployed-ai-video-gen-url.com \
     Bloocube-frontend
   ```

2. **Or set it as a default substitution in Cloud Build:**
   - Go to Cloud Build → Triggers
   - Edit your trigger
   - Add substitution variable: `_NEXT_PUBLIC_AI_VIDEO_GEN_URL` = `https://your-deployed-ai-video-gen-url.com`
   - Save and run the trigger

### Option 2: Using Secret Manager (For Sensitive URLs)

1. **Create a secret in Secret Manager:**
   ```bash
   echo -n "https://your-deployed-ai-video-gen-url.com" | \
     gcloud secrets create next-public-ai-video-gen-url \
     --data-file=-
   ```

2. **Grant Cloud Build access:**
   ```bash
   gcloud secrets add-iam-policy-binding next-public-ai-video-gen-url \
     --member="serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Update cloudbuild.yaml** to use the secret (requires additional configuration)

### Option 3: Hardcode in cloudbuild.yaml (Quick Fix)

If the URL is not sensitive, you can directly set it in `cloudbuild.yaml`:

```yaml
- '--build-arg'
- 'NEXT_PUBLIC_AI_VIDEO_GEN_URL=https://your-deployed-ai-video-gen-url.com'
```

## Verification

After deployment:
1. Open your deployed frontend
2. Navigate to Creator or Brand dashboard
3. Click "AI Video" in the sidebar
4. The modal should load your AI Video Generator site

## Troubleshooting

### Still showing "Not Configured"?
1. **Check build logs** - Look for the echo statement showing the URL was set
2. **Verify the URL** - Make sure it's accessible and doesn't have trailing slashes
3. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
4. **Check browser console** - Look for the warning message with debug info

### Build fails?
- Make sure the substitution variable is set correctly
- Check that the URL is valid and accessible
- Verify Dockerfile has the ARG and ENV statements

## Important Notes

- **The URL is baked into the build** - You must rebuild and redeploy to change it
- **No trailing slashes** - The URL should not end with `/`
- **HTTPS required** - Use HTTPS URLs for production
- **CORS/Embedding** - Ensure your AI Video Generator site allows embedding in iframes

