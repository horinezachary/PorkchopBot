const Command = require(`${process.cwd()}/base/Command.js`);
let { MessageEmbed } = require("discord.js");

class adminpay extends Command {
  constructor(client) {
    super(client, {
      name: "adminpay",
      description: "Pay someone else credits from the admin pool!",
      usage: "adminpay <user> <amount>",
      aliases: ["apay"],
      permRequired: "MANAGE_GUILD",
      premiumTier: true
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

    if (msg.mentions.users.first()) {
      if (await bot.economy.getGuildEconomyMode(msg.guild.id) == "GUILD") {
        console.log("GUILD");
        let result = await bot.economy.addBal(msg.guild.id,msg.mentions.users.first().id,amount);

        if (result && !result.message) { //success
          msg.channel.send({
            embed: new MessageEmbed()
              .setAuthor("Admin Pay")
              .setColor(msg.color)
              .setDescription("Paid " + msg.mentions.users.first().toString() + " " + amount + " credits!")
              .setFooter("Powered by " + bot.user.username)
              .setTimestamp()
          });
        } else if (result.message) { //failure, print message
          msg.channel.send({
            embed: new MessageEmbed()
              .setAuthor("Admin Pay")
              .setColor(msg.color)
              .setDescription(result.message)
              .setFooter("Powered by " + bot.user.username)
              .setTimestamp()
          });
        }
      } else if (await bot.economy.getGuildEconomyMode(msg.guild.id) == "GLOBAL"){
        let perms = await bot.utils.getPermission(bot,msg.author,msg.guild,"BOTADMIN");
        console.log(perms);
        if (perms.valid) {
          let result = await bot.economy.addBal(msg.guild.id,msg.mentions.users.first().id,amount);

          if (result && !result.message) { //success
            msg.channel.send({
              embed: new MessageEmbed()
                .setAuthor("Admin Pay")
                .setColor(msg.color)
                .setDescription("Paid " + msg.mentions.users.first().toString() + " " + amount + " credits!")
                .setFooter("Powered by " + bot.user.username)
                .setTimestamp()
            });
          } else if (result.message) { //failure, print message
            msg.channel.send({
              embed: new MessageEmbed()
                .setAuthor("Admin Pay")
                .setColor(msg.color)
                .setDescription(result.message)
                .setFooter("Powered by " + bot.user.username)
                .setTimestamp()
            });
          }
        } else {
          msg.reply(perms.message);
        }
      } else {
        console.log(await bot.economy.getGuildEconomyMode(msg.guild.id));
        console.log("unknown guild mode");
      }
    }
  }
}

module.exports = adminpay;
