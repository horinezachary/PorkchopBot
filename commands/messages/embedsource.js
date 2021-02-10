const Command = require(`${process.cwd()}/base/Command.js`);

class embedsource extends Command {
  constructor(client) {
    super(client, {
      name: "embedsource",
      description: "Retrieve the JSON for a given embed",
      usage: "embedsource [channel] <message_id>",
      aliases: [],
      permRequired: "MANAGE_MESSAGES"
    });
  }

  async run(bot, msg, args, level) {
    let { MessageEmbed } = require("discord.js");
    let channel = msg.channel;
    let message;
    for (let arg of args) {
      let argChannel = "";
      if (arg && arg.match(/^(?:<#)?([0-9]{18})(?:>)?$/g)) { //is a channel id or an id in general
        argChannel = await msg.guild.channels.cache.get(arg.match(/([0-9]{18})/g)[0]);
        if (argChannel != undefined) {
          channel = argChannel;
        }
      }
    }
    for (let arg of args) {
      if (arg && arg.match(/^[0-9]{18}$/g) && arg.match(/^[0-9]{18}$/g)[0] != channel.id) { //most likeley a message id
        let argMessage = await channel.messages.fetch(arg.match(/^[0-9]{18}$/g)[0]);
        if (argMessage) {
          message = argMessage;
        }
      }
    }
    channel.send({embed: new MessageEmbed()
      .setAuthor("Embed Source: "+message.id, bot.user.avatarURL())
      .setColor(bot.config.DEFAULT_EMBED_COLOR)
//      .setDescription(JSON.stringify(message.embeds))
      .setDescription("```json\n"+JSON.stringify(message.embeds[0],null,2)+"```")
      .setFooter("Powered by " + bot.user.username)
      .setTimestamp()
    });
  }
}

module.exports = embedsource;
