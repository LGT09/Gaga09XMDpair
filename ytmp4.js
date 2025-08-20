const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

module.exports = {
  name: "ytmp4",
  description: "Download YouTube video as mp4. Usage: .ytmp4 <url>",
  async run({ sock, from, msg, args }) {
    const url = args[0];
    if (!url) return await sock.sendMessage(from, { text: 'Usage: .ytmp4 <url>' }, { quoted: msg });
    const outFile = path.join(tmpdir(), `gaga_vid_${Date.now()}.mp4`);
    try {
      await youtubedl(url, {
        output: outFile,
        format: 'mp4',
        noWarnings: true,
        noCallHome: true,
      });
      if (!fs.existsSync(outFile)) return await sock.sendMessage(from, { text: 'Download failed.' }, { quoted: msg });
      const buffer = fs.readFileSync(outFile);
      await sock.sendMessage(from, { video: buffer, mimetype: 'video/mp4' }, { quoted: msg });
      fs.unlinkSync(outFile);
    } catch (e) {
      console.error('ytmp4 error', e);
      await sock.sendMessage(from, { text: 'ytmp4 failed: ' + e.message }, { quoted: msg });
    }
  }
};
