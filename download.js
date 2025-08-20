const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

module.exports = {
  name: "download",
  description: "Generic downloader using youtube-dl-exec. Usage: .download <url>",
  async run({ sock, from, msg, args }) {
    const url = args[0];
    if (!url) return await sock.sendMessage(from, { text: 'Usage: .download <url>\nSupports YouTube, TikTok, Instagram, etc.' }, { quoted: msg });
    const outFile = path.join(tmpdir(), `gaga_dl_${Date.now()}.%(ext)s`);
    try {
      const info = await youtubedl(url, {
        output: outFile,
        limitRate: '1M',
        noWarnings: true,
        noCallHome: true,
      });
      // youtube-dl-exec spawns download, the output file path is in info._filename sometimes
      const filepath = info && info._filename ? info._filename : null;
      if (!filepath || !fs.existsSync(filepath)) {
        return await sock.sendMessage(from, { text: 'Download finished but file not found. Check server logs.' }, { quoted: msg });
      }
      const stat = fs.statSync(filepath);
      // send as document if large
      await sock.sendMessage(from, { document: fs.readFileSync(filepath), fileName: path.basename(filepath) }, { quoted: msg });
      fs.unlinkSync(filepath);
    } catch (e) {
      console.error('download failed', e);
      await sock.sendMessage(from, { text: 'Download failed: ' + e.message }, { quoted: msg });
    }
  }
};
