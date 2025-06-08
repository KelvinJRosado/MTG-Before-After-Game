# MTG Higher or Lower Game UI

This is the frontend for the MTG Higher or Lower Game. It's built with Vue 3 and Vite, and can be deployed to Vercel.

## Local Development

To run the UI locally:

```bash
# Install dependencies (from root directory)
npm install

# Run the UI dev server
npm run serve:ui
```

The UI will be available at http://localhost:4200/

## Deployment to Vercel

This project is configured to be deployed on Vercel. The configuration is handled by the `vercel.json` file in the root directory.

To deploy:

1. Push your changes to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically build and deploy the UI

The build process uses the `npm run build:ui` command defined in the root package.json.
