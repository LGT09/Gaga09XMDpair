module.exports = {
  name: "owner",
  description: "owner contact (exact reply)",
  async run({ sock, from, msg }) {
    const out = "Here is my Daddy Vincent Ganiza a.k.a Lil Gaga Traxx09 with the phone number 263780078177, 263716857999";
    await sock.sendMessage(from, { text: out }, { quoted: msg });
  }
};
