module.exports = {
  apps : [{
    name: "gaga09xmd-bot",
    script: "index.js",
    watch: false,
    env: {
      NODE_ENV: "production"
    }
  },{
    name: "gaga09xmd-web",
    script: "web/server.js",
    watch: false
  }]
};
