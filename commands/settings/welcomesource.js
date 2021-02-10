const Command = require(`${process.cwd()}/base/Command.js`);

class welcomesource extends Command {
  constructor(client) {
    super(client, {
      name: "welcomesource",
      description: "Retrieve the channel and JSON for the welcome message",
      usage: "welcomesource",
      aliases: [],
      permRequired: "MANAGE_SERVER"
    });
  }

  async run(bot, msg, args, level) {
    let { MessageEmbed } = require("discord.js");

    let welcome = await bot.database.getGuildWelcome(msg.guild.id);

    if (welcome) {
      msg.channel.send({embed: new MessageEmbed()
        .setAuthor("Welcome Message")
        .setColor(bot.config.DEFAULT_EMBED_COLOR)
        .setDescription("**Channel: **"+"<#"+welcome.channel_id+">"+"\n **Embed: **\n ```json\n"+JSON.stringify(JSON.parse(welcome.embed),null,2)+"```")
        .setFooter("Powered by " + bot.user.username)
        .setTimestamp()
      });
    } else {
      msg.channel.send({embed: new MessageEmbed()
        .setAuthor("Welcome Message")
        .setColor(bot.config.DEFAULT_EMBED_COLOR)
        .setDescription("**There is no welcome message registered for this server.**")
        .setFooter("Powered by " + bot.user.username)
        .setTimestamp()
      });
    }
  }
}

module.exports = welcomesource;
