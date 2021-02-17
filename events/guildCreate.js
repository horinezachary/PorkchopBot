const moment = require("moment");

module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot,guild) {
    await bot.database.query(`INSERT IGNORE INTO guild(guild_id,prefix) VALUES("${guild.id}","${bot.config.PREFIX}")`);
  }
}
