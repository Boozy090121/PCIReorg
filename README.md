# Quality Re-organization Tool

## Deployment Instructions

### Overview
This is a simple deployment-ready version of the Quality Re-organization Tool that uses CDN links instead of a build process. This approach allows the application to be deployed to Netlify without requiring Node.js or npm to be installed.

### Deployment to Netlify

1. Push this repository to GitHub (or GitLab/BitBucket)
2. Log in to your Netlify account
3. Click "New site from Git"
4. Select your repository
5. In the build settings:
   - Build command: **Leave empty** (critical - do not set a build command)
   - Publish directory: `.` (root directory)
6. Click "Deploy site"

### Important Notes for Netlify
- The `netlify.toml` file has been configured with `command = ""` to explicitly tell Netlify not to run any build command
- If you encounter build errors, go to Site settings > Build & deploy > Continuous Deployment > Build settings and ensure that the "Build command" field is empty
- You can also set environment variable `NETLIFY_SKIP_BUILD=true` in your site settings to prevent Netlify from running a build

### Files
- `index.html`: Main entry point with all CDN references
- `netlify.toml`: Netlify configuration file 

### CDN Dependencies
- React 18
- React DOM 18
- Redux 4.2.1
- React-Redux 8.1.2
- Material UI 5.15.3
- Emotion React 11.11.1
- Emotion Styled 11.11.0

### Notes
- This is a simplified version for easy deployment
- For a production application, a proper build process with bundling is recommended 