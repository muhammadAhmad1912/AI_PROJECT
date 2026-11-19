# RoadWatch UAE

A student prototype for documenting road damage with a photo, location details and an AI-assisted assessment.

## View the website online
After GitHub Pages is enabled, the public website will be available at:

https://muhammadAhmad1912.github.io/AI_PROJECT/

Every push to the main branch that changes RoadWatch_UAE automatically triggers a redeployment through GitHub Actions. The first deployment may take a few minutes.

## Enable GitHub Pages (one-time setup)
1. Open the repository Settings.
2. Select Pages in the left sidebar.
3. Under Build and deployment, set Source to GitHub Actions.
4. Open the Actions tab and wait for "Deploy RoadWatch UAE to GitHub Pages" to finish.
5. Visit the URL above.

## Run locally
Open this folder in VS Code and use Live Server, or run `python -m http.server 8000` from this folder and visit http://localhost:8000.

## Features
- Upload and preview a road photo
- Request browser location and show coordinates / Google Maps link
- Enter emirate, road/landmark, damage type and description
- Generate a report summary
- Copy or download the summary and print/save it as PDF
- Link to TAMM for manual follow-up

## Important limitations
- The Teachable Machine model is not connected yet. The current analysis panel is a placeholder and does not make real predictions.
- This student prototype does not submit reports directly to TAMM or another UAE government system.
- Browser geolocation requires HTTPS (GitHub Pages provides HTTPS) or localhost. Visitors must allow location permission. If they decline, they can enter a road name or landmark instead.
- AI output, once connected, should be treated as an aid rather than an official engineering assessment.
