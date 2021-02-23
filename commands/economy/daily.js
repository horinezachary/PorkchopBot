const Command = require(`${process.cwd()}/base/Command.js`);

class daily extends Command {
  constructor(client) {
    super(client, {
      name: "daily",
      description: "Claim the daily amount of money you can recieve!",
      usage: "daily",
      aliases: ["dailies"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    const moment = require("moment");
    let daily = await bot.economy.daily(msg.author.id,msg.guild.id);
    console.log(daily);
    if (typeof(daily) == "object" && daily.result == false) {
      msg.reply(
        "not so fast! You still have to wait **" +
          moment(daily.lastDaily + 86400000).fromNow(true) +
          "** to claim your dailies!"
      );
    } else {
      msg.reply("you have recieved your 1000 daily credits!");
    }
  }
}

module.exports = daily;
