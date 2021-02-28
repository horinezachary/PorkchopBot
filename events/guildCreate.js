const moment = require("moment");

module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot,guild) {
    await bot.database.query(`INSERT IGNORE INTO guild(guild_id,prefix,guild_economy_mode,guild_economy_daily) VALUES("${guild.id}","${bot.config.PREFIX}","GLOBAL",${bot.config.economy.GLOBAL_DAILY})`);
  }
}
