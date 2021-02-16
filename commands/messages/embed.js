const Command = require(`${process.cwd()}/base/Command.js`);

class embed extends Command {
  constructor(client) {
    super(client, {
      name: "embed",
      description: "Send a custom embed!",
      usage: "embed [channel] <json>",
      aliases: [],
      permRequired: "MANAGE_MESSAGES"
    });
  }

  async run(bot, msg, args, level) {
    let channel = msg.channel;
    if (args[0] && args[0].match(/^(?:<#)?[0-9]{18}(?:>)?$/g)) { //is a channel id or an id in general
      let argChannel = await msg.guild.channels.cache.get(args[0].match(/(?:<#)?[0-9]{18}(?:>)?/g));
      if (argChannel) {
        channel = argChannel;
      }
    }
    let jsonString = msg.content.substr(msg.content.indexOf("{"), msg.content.lastIndexOf("}"));
    let jsonObj = JSON.parse(jsonString);
    console.log(jsonObj);
    channel.send({embed: jsonObj}).then((message) => {
      bot.database.newEmbed(msg.guild.id,channel.id,message.id);
    });
  }
}

module.exports = embed;
