const axios = require('axios');
module.exports = {
  name: "gaga09xmd",
  description: "AI main command wired to OpenAI. Usage: .gaga09xmd <prompt>",
  async run({ sock, from, msg, args }) {
    const prompt = args.join(' ');
    if (!prompt) return await sock.sendMessage(from, { text: 'Usage: .gaga09xmd <prompt>' }, { quoted: msg });
    const key = process.env.OPENAI_API_KEY;
    if (!key) return await sock.sendMessage(from, { text: 'OpenAI API key not set (OPENAI_API_KEY).' }, { quoted: msg });
    try {
      const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini', // change as desired
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800
      }, {
        headers: { Authorization: `Bearer ${key}` }
      });
      const content = resp.data.choices && resp.data.choices[0] && resp.data.choices[0].message ? resp.data.choices[0].message.content : 'No response.';
      await sock.sendMessage(from, { text: content + '\n\n' + require('../config').CHANNEL + '\n' + require('../config').SIGNATURE }, { quoted: msg });
    } catch (e) {
      console.error('OpenAI error', e.response ? e.response.data : e.message);
      await sock.sendMessage(from, { text: 'AI error: ' + (e.response && e.response.data ? JSON.stringify(e.response.data) : e.message) }, { quoted: msg });
    }
  }
};
