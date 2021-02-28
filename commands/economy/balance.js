const Command = require(`${process.cwd()}/base/Command.js`);
  let { MessageEmbed } = require("discord.js");

class balance extends Command {
  constructor(client) {
    super(client, {
      name: "balance",
      description: "Check how much money you have!",
      usage: "balance",
      aliases: ["bal"],
      permRequired: "USER"
    });
  }

  async run(bot, msg, args, level) {
    let user = msg.author;
    if (msg.mentions.users.first()) {
      user = msg.mentions.users.first();
    }
    let balance = await bot.economy.getBal(msg.guild.id,user.id);
    console.log(balance);
    msg.channel.send({
      embed: new MessageEmbed()
        .setAuthor(user.username + "'s Balance", bot.users.cache.get(user.id).displayAvatarURL())
        .setColor(msg.color)
        .setDescription("<@"+user.id+">'s balance: `"+balance+"`")
        .setFooter("Powered by " + bot.user.username)
        .setTimestamp()
    });
  }
}

module.exports = balance;
