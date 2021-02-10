const Command = require(`${process.cwd()}/base/Command.js`);

class ping extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "Test your connection to the bot!",
      usage: "ping",
      aliases: [],
      permRequired: "BOTADMIN"
    });
  }

  async run(bot, msg, args, level) {
    let { MessageEmbed } = require("discord.js");
    msg.channel.send(":ping_pong: Pong!");
  }
}

module.exports = ping;
