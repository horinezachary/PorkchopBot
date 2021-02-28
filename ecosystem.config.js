module.exports = {
  apps : [
      {
        name: "PorkchopBot",
        script: "npm start",
        watch: false,
        env: {
          "NODE_ENV": "production",
	        "NODE_PATH": "/root/.nvm/versions/node/v15.2.1/bin/node"
       },
      }
  ]
}
