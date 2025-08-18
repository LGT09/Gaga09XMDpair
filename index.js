/*
  Gaga09 XMD - Main entry (enhanced)
  - Dynamic command loader
  - youtube-dl-exec based downloader (supports YouTube, TikTok, Instagram, many)
  - Saves QR as data URL to sessions/qr.png for web pairing UI
  - AI command wired to OpenAI via OPENAI_API_KEY
*/

const baileys = require('@adiwajshing/baileys');
const { default: makeWaSocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = baileys;
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { exec } = require('child_process');
const youtubedl = require('youtube-dl-exec');
const ffmpegPath = require('ffmpeg-static');
const axios = require('axios');

const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });

const { state, saveState } = useSingleFileAuthState(path.join(sessionsDir, 'auth_info.json'));

const commands = new Map();

// dynamic loader
function loadCommands() {
  const cmdsDir = path.join(__dirname, 'commands');
  if (!fs.existsSync(cmdsDir)) return;
  const walk = (dir) => {
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f);
      if (fs.statSync(fp).isDirectory()) walk(fp);
      else if (f.endsWith('.js')) {
        try {
          const mod = require(fp);
          if (mod && mod.name) commands.set(mod.name.toLowerCase(), mod);
        } catch (e) {
          console.error('Failed loading', fp, e);
        }
      }
    }
  };
  walk(cmdsDir);
}
loadCommands();

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWaSocket({
    version,
    printQRInTerminal: false,
    auth: state,
    logger: require('pino')({ level: 'silent' }),
    generateHighQualityLinkPreview: true
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      // save QR as image for web UI
      try {
        const dataUrl = await qrcode.toDataURL(qr);
        const base64 = dataUrl.split(',')[1];
        fs.writeFileSync(path.join(sessionsDir, 'qr.png'), Buffer.from(base64, 'base64'));
        console.log('QR saved to sessions/qr.png');
      } catch (e) {
        console.error('QR save failed', e);
      }
      console.log('Open web UI /qr to view pairing QR.');
    }
    if (connection === 'close') {
      const reason = (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output) ? lastDisconnect.error.output.statusCode : null;
      console.log("Connection closed:", reason);
      if (reason !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log("Logged out. Delete sessions/auth_info.json and re-run to re-pair.");
      }
    }
    if (connection === 'open') console.log('Gaga09 XMD connected.');
  });

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg || !msg.message) return;
      if (msg.key && msg.key.remoteJid === 'status@broadcast') return;
      const from = msg.key.remoteJid;
      const content = msg.message.conversation || (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || '';
      const text = content.trim();
      const norm = text.startsWith(config.PREFIX) ? text.slice(config.PREFIX.length) : text;
      const parts = norm.split(/\s+/);
      const cmd = parts[0] ? parts[0].toLowerCase() : '';
      const args = parts.slice(1);

      // if command exists in loader
      if (commands.has(cmd)) {
        const handler = commands.get(cmd);
        try {
          await handler.run({ sock, from, msg, args, config });
        } catch (e) {
          console.error('Command error', cmd, e);
          await sock.sendMessage(from, { text: 'Command failed: ' + e.message + '\\n' + config.CHANNEL + '\\n' + config.SIGNATURE }, { quoted: msg });
        }
        return;
      }

      // basic built-ins
      if (cmd === 'menu' || cmd === 'help' || cmd === 'listmenu') {
        const out = `Gaga09 XMD Commands (sample):\\n- .menu .gaga09xmd .ytmp3 .ytmp4 .download .owner\\n\\nChannel: ${config.CHANNEL}\\n${config.SIGNATURE}`;
        await sock.sendMessage(from, { text: out }, { quoted: msg });
        return;
      }
      if (cmd === 'owner') {
        const out = "Here is my Daddy Vincent Ganiza a.k.a Lil Gaga Traxx09 with the phone number 263780078177, 263716857999\\n\\nChannel: " + config.CHANNEL + "\\n" + config.SIGNATURE;
        await sock.sendMessage(from, { text: out }, { quoted: msg });
        return;
      }

      // unknown short message
      if (text.length < 50) {
        const out = `Unknown command. Send .menu to see commands.\\nChannel: ${config.CHANNEL}\\n${config.SIGNATURE}`;
        await sock.sendMessage(from, { text: out }, { quoted: msg });
      }
    } catch (e) {
      console.error('message handler error:', e);
    }
  });

  // periodic save
  setInterval(() => saveState(), 10 * 1000);
}

startBot().catch(e => console.error(e));
