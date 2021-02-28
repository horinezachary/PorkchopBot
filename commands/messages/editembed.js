const Command = require(`${process.cwd()}/base/Command.js`);

class editembed extends Command {
  constructor(client) {
    super(client, {
      name: "editembed",
      description: "Update an embed!",
      usage: "editembed [channel] <message_id> <json>",
      aliases: ["edembed"],
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
    if (message) {
      let jsonString = msg.content.substr(msg.content.indexOf("{"), msg.content.lastIndexOf("}"));
      let jsonObj = JSON.parse(jsonString);
      console.log(jsonObj);
      message.edit({embed: jsonObj});
    }
  }
}

module.exports = editembed;
