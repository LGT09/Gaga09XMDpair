# Gaga09XMD - Render-ready bundle

What's included:
- WhatsApp bot (Baileys) with downloader integrations via youtube-dl-exec and ffmpeg-static.
- AI command wired to OpenAI using env var OPENAI_API_KEY.
- Simple blue-theme web pairing UI at `/` (served by web/server.js); QR image saved to `sessions/qr.png`.
- Dockerfile, Procfile, and pm2 ecosystem for deployment.
- IMPORTANT: Keep `sessions/auth_info.json` persistent in your Render/Web host storage. Otherwise the bot will require re-pairing.

## Setup (local)
1. unzip
2. `cd Gaga09XMD-Render`
3. `npm install`
4. `node web/server.js` (starts web UI on PORT)
5. `node index.js` (starts bot; generates QR and saves to sessions/qr.png)
6. Visit `http://localhost:3000` to see pairing page.

## Deploy to Render
- Create a Web Service for `web/server.js` (PORT 10000 or as provided by Render).
- Create a Background Worker or Services for `node index.js` to run the bot.
- Ensure `sessions/` folder is mapped to persistent disk on Render so `auth_info.json` survives restarts.

## Google Drive Images
You provided two Google Drive links. To include them in the web UI:
- Make the files *public* and then replace `/web/static/branding1.png` and `/web/static/branding2.png` with the public URLs in the HTML, or download them to `web/static/` and name accordingly.

## Security
- Do NOT commit API keys. Use Render environment variables (OPENAI_API_KEY, etc.).
- Downloader functionality uses `youtube-dl-exec` which supports many sites but may break for some platforms; respect copyrights.

