const Command = require(`${process.cwd()}/base/Command.js`);
const Discord = require("discord.js");

class unban extends Command {
  constructor(client) {
    super(client, {
      name: "unban",
      description: "Unbans a user from the server by mention/id.",
      usage: "unban <user> <reason>",
      aliases: [],
      permRequired: "BAN_MEMBERS"
    });
  }

  async run(bot, msg, args, level) {
    let reason = "";
    let reasonStart = false;
    let user_id = "";
    for (let arg of args) {
      if (reasonStart) {
        reason += arg + " ";
      }
      if (arg && arg.match(/([0-9]{18})/g)) { //is a user id or an id in general
        if (user_id == "") {
          user_id = arg.match(/([0-9]{18})/g)[0];
          reasonStart = true;
        }
      }
    }
    reason = reason.trim();
    let options = {reason: reason};
    let result = false;
    msg.guild.members.unban(user_id,options).then(
      msg.reply(new Discord.MessageEmbed()
        .setAuthor("User Unbanned", bot.user.avatarURL())
        .setColor(bot.config.DEFAULT_EMBED_COLOR)
        .setFooter(msg.author.username, msg.author.avatarURL())
        .setTimestamp()
        .setDescription(`User:<@${user_id}> (${user_id})\n`+
                        `Moderator: <@${msg.author.id}>\n`)));
  }
}

module.exports = unban;
