# AI Video Generator Integration Setup

## Quick Setup

1. **Create `.env.local` file** in the root of `Bloocube-frontend` directory (same level as `package.json`)

2. **Add the environment variable:**
   ```env
   NEXT_PUBLIC_AI_VIDEO_GEN_URL=https://your-deployed-ai-video-gen-url.com
   ```
   Replace `https://your-deployed-ai-video-gen-url.com` with your actual deployed URL.

3. **Restart your Next.js development server:**
   - Stop the current server (Ctrl+C)
   - Start it again with `npm run dev` or `yarn dev`

## Troubleshooting

### Issue: "NEXT_PUBLIC_AI_VIDEO_GEN_URL is not configured"

**Common Causes:**

1. **Server not restarted** ⚠️ Most Common
   - Next.js only loads environment variables on startup
   - After adding `.env.local`, you MUST restart the dev server
   - Solution: Stop and restart your dev server

2. **Wrong file name**
   - Should be `.env.local` (not `.env`, `.env.development`, etc.)
   - Location: Root of `Bloocube-frontend` directory

3. **Wrong variable name**
   - Must be exactly: `NEXT_PUBLIC_AI_VIDEO_GEN_URL`
   - Must start with `NEXT_PUBLIC_` to be exposed to client-side code

4. **Syntax error in .env file**
   - No spaces around the `=` sign
   - No quotes needed (unless URL has special characters)
   - Correct: `NEXT_PUBLIC_AI_VIDEO_GEN_URL=https://example.com`
   - Wrong: `NEXT_PUBLIC_AI_VIDEO_GEN_URL = "https://example.com"` (has spaces and quotes)

5. **File not in correct location**
   - `.env.local` should be in: `Bloocube-frontend/.env.local`
   - Same directory as `package.json`, `next.config.ts`

## Verification

After setup, check the browser console:
- If configured correctly: No warning messages
- If not configured: You'll see a warning with debug information

## Production Deployment

For production (Cloud Run, Vercel, etc.), add the environment variable in your deployment platform's settings:
- Variable name: `NEXT_PUBLIC_AI_VIDEO_GEN_URL`
- Value: Your deployed AI Video Generator URL

## Example .env.local

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# AI Video Generator URL
NEXT_PUBLIC_AI_VIDEO_GEN_URL=https://ai-video-gen.vercel.app
```

