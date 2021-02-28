const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");

class baltop extends Command {
  constructor(client) {
    super(client, {
      name: "baltop",
      description: "Check the balance leaderboard!",
      usage: "baltop",
      aliases: ["lb"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    let topTwenty = await bot.economy.getBalTop(msg.guild.id,0,19);
    console.log(topTwenty);
    if (topTwenty.length > 0) {
      let lb = new MessageEmbed()
        .setAuthor(msg.guild.name + " Balance Leaderboard",msg.guild.iconURL())
        .setColor(msg.guild.me.displayHexColor)
        .setFooter("Powered by " + bot.user.username, bot.user.avatarURL());

      topTwenty.forEach(user => {
        lb.addField(
          bot.users.cache.get(user.user_id)
            ? bot.users.cache.get(user.user_id).username
            : "Uncached User",
          user.bank,
          true
        );
      });
      msg.channel.send({ embed: lb });
    } else {
      let lb = new MessageEmbed()
        .setAuthor(msg.guild.name + " Balance Leaderboard",msg.guild.iconURL())
        .setColor(msg.guild.me.displayHexColor)
        .setFooter("Powered by " + bot.user.username, bot.user.avatarURL())
        .setDescription("There are no users on the leaderboard at the moment...");
      msg.channel.send({ embed: lb });
    }
  }
}

module.exports = baltop;
