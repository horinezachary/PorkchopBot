const Command = require(`${process.cwd()}/base/Command.js`);
const Discord = require("discord.js");

class blacklist extends Command {
  constructor(client) {
    super(client, {
      name: "blacklist",
      description: "Blacklists a user from the bot by mention/id. use G or GLOBAL to blacklist the user in all servers",
      usage: "blacklist [G/GLOBAL] <user> <reason>",
      aliases: ["bl"],
      permRequired: "BOTADMIN"
    });
  }

  async run(bot, msg, args, level) {
    let scope = "GUILD";
    let user_id = "";
    if (args[0].toLowerCase() == "g" || args[0].toLowerCase() == "global") {
      //global
      scope = "GLOBAL";
    }
    let reason = "";
    let reasonStart = false;
    for (let arg of args) {
      if (reasonStart) {
        reason += arg + " ";
      }
      if (arg && arg.match(/([0-9]{18})/g)) { //is a channel id or an id in general
        console.log(arg.match(/([0-9]{18})/g));
        let argUser = await msg.guild.members.cache.get(arg.match(/([0-9]{18})/g)[0]);
        if (argUser != undefined && user_id == "") {
          user_id = argUser.id;
          reasonStart = true;
        }
      }
    }
    reason = reason.trim();
    let result = await bot.database.blacklist(scope,msg.guild.id,user_id,msg.author.id,reason);
    if (result) {
      msg.reply(new Discord.MessageEmbed()
      .setAuthor("Blacklist", bot.user.avatarURL())
      .setColor(bot.config.DEFAULT_EMBED_COLOR)
      .setFooter(msg.author.username, msg.author.avatarURL())
      .setTimestamp()
      .setDescription(`User:<@${user_id}> (${user_id})\n`+
                      `Scope: ${scope}\n`+
                      `Moderator: <@${msg.author.id}>\n`+
                      "Reason: ```"+reason+"```"));
    }
  }
}

module.exports = blacklist;
