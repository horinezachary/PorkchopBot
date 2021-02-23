const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");

class coinflip extends Command {
  constructor(client) {
    super(client, {
      name: "coinflip",
      description: "",
      usage: "coinflip <heads or tails> <amount> ",
      aliases: ["cf"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    var amount;

    if (!args[0]) return msg.reply("please enter a heads or tails /cf <h or t> <bet amount> ");

    if (args[1] && isNaN(args[1])) amount = 10;
    else if (args[1] && args[1] > 0 && !isNaN(args[1])) amount = Number(args[1]);
    else amount = 10;

    let balance = (await bot.economy.getBal(msg.guild.id,msg.author.id)) || {};
    if (!balance || balance == 0)
      return msg.reply(
        "your balance is 0! Please claim your dailies if you are able to do so to play!"
      );
    if (balance < amount)
      return msg.reply("you don't have enough money to cover that bet!");

    var i = Math.floor(Math.random() * 2);
    var embed = new MessageEmbed();
    if (args[0] == "h" || args[0] == "heads" || args[0] == "head") {
      if (i == 0) {
        embed
          .setTitle("** Coin Flip Bid Amount:** " + amount + " credits")
          .setAuthor(msg.author.username, msg.author.avatarURL())
          .setDescription("**Heads!**\nYou won " + Math.ceil(amount * 0.1) + " credits");
        bot.economy.addBal(msg.guild.id, msg.author.id, Math.ceil(amount * 0.1));
      } else {
        embed
          .setTitle("** Coin Flip Bid Amount:** " + amount + " credits")
          .setAuthor(msg.author.username, msg.author.avatarURL())
          .setDescription("**Tails!**\nYou didn't win anything :(");
        bot.economy.subBal(msg.guild.id, msg.author.id, amount);
      }
    } else if (args[0] == "t" || args[0] == "tails" || args[0] == "tail") {
      if (i == 1) {
        embed
          .setTitle("** Coin Flip Bid Amount:** " + amount + " credits")
          .setAuthor(msg.author.username, msg.author.avatarURL())
          .setDescription("**Tails!**\nYou won " + Math.ceil(amount * 0.1) + " credits");
        bot.economy.subBal(msg.guild.id, msg.author.id, Math.ceil(amount * 0.1));
      } else {
        embed
          .setTitle("** Coin Flip Bid Amount:** " + amount + " credits")
          .setAuthor(msg.author.username, msg.author.avatarURL())
          .setDescription("**Heads!**\nYou didn't win anything :(");
        bot.economy.subBal(msg.guild.id, msg.author.id, amount);
      }
    } else {
      return msg.reply("please enter a heads or tails /cf <h or t> <bet amount>");
    }
    return msg.channel.send({ embed: embed })
  }
}

module.exports = coinflip;
