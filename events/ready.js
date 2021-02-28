const moment = require("moment");

module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot) {
    setTimeout(function () {
      bot.logger.ready(`Logged in as ${bot.user.tag}!`);
      bot.logger.ready(bot.user.username + " is ready! Serving " + bot.guilds.cache.size + " servers.");
      bot.user.setActivity(bot.config.PREFIX,{type:"LISTENING"});
      bot.channels.cache.get(bot.config.LOG_CHANNEL).send("`[" + moment().format("YYYY-MM-DD HH:mm:ss") + "]` :loudspeaker: **" + bot.user.tag + "** is online and ready! Serving " + bot.users.cache.size + " users in " + bot.guilds.cache.size + " servers!");
    }, 1000);

    //sync invites
    let guilds = bot.guilds.cache;
    bot.inviteCache = [];
    for (let guild in guilds) {
      bot.inviteCache.push({guild: guild.id, invites: await bot.utils.parseInvites(guild)});
    }
  }
}
