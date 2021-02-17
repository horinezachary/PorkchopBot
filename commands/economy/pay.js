const Command = require(`${process.cwd()}/base/Command.js`);
let { MessageEmbed } = require("discord.js");

class pay extends Command {
  constructor(client) {
    super(client, {
      name: "pay",
      description: "Pay someone else credits from your balance!",
      usage: "pay <user> <amount>",
      aliases: [],
      permRequired: "USER"
    });
  }

  async run(bot, msg, args, level) {
    var amount;
    if (!msg.mentions.users.first())
      return msg.reply("please specify who you would like to pay!");
    if (!args[1]) return msg.reply("please specify an amount to pay!");
    if (args[1] && isNaN(args[1]))
      return msg.reply("please specify an amount to pay!");
    else if (args[1] && !isNaN(args[1])) amount = Number(args[1]);

    if (amount <= 0) return msg.reply("you cannot pay a negative amount!");

    if (msg.mentions.users.first() == msg.author)
      return msg.reply("why would you pay yourself?");

      if (msg.mentions.users.first()) {
        console.log(msg.mentions.users);
      let result = await bot.economy.pay(msg.guild.id,msg.author.id,msg.mentions.users.first().id,amount);

      if (result == true) { //success
        /*msg.reply(
          msg.author.toString()+" paid " +
            msg.mentions.users.first().toString() +
            " " +
            amount +
            " credits!"
        );*/
        msg.channel.send({
          embed: new MessageEmbed()
            .setAuthor("Pay")
            .setColor(msg.color)
            .setDescription(  msg.author.toString()+" paid " + msg.mentions.users.first().toString() + " " + amount + " credits!")
            .setFooter("Powered by " + bot.user.username)
            .setTimestamp()
        });
      } else if (result.message) { //failure, print message
        msg.channel.send({
          embed: new MessageEmbed()
            .setAuthor("Pay")
            .setColor(msg.color)
            .setDescription(result.message)
            .setFooter("Powered by " + bot.user.username)
            .setTimestamp()
        });
        return;
      }
    }
  }
}

module.exports = pay;
