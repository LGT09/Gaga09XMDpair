const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const ffmpegPath = require('ffmpeg-static');

module.exports = {
  name: "ytmp3",
  description: "Download YouTube audio as mp3. Usage: .ytmp3 <url>",
  async run({ sock, from, msg, args }) {
    const url = args[0];
    if (!url) return await sock.sendMessage(from, { text: 'Usage: .ytmp3 <url>' }, { quoted: msg });
    const outFile = path.join(tmpdir(), `gaga_yt_${Date.now()}.mp3`);
    try {
      await youtubedl(url, {
        extractAudio: true,
        audioFormat: 'mp3',
        output: outFile,
        ffmpegLocation: ffmpegPath,
        noWarnings: true,
        noCallHome: true,
      });
      if (!fs.existsSync(outFile)) return await sock.sendMessage(from, { text: 'Conversion failed.' }, { quoted: msg });
      const buffer = fs.readFileSync(outFile);
      await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: msg });
      fs.unlinkSync(outFile);
    } catch (e) {
      console.error('ytmp3 error', e);
      await sock.sendMessage(from, { text: 'ytmp3 failed: ' + e.message }, { quoted: msg });
    }
  }
};
