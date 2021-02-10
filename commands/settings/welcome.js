const Command = require(`${process.cwd()}/base/Command.js`);

class welcome extends Command {
  constructor(client) {
    super(client, {
      name: "welcome",
      description: "Update the welcome message!",
      usage: "welcome [channel] <json>",
      aliases: [],
      permRequired: "MANAGE_SERVER"
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
    let embed = JSON.stringify(jsonObj);
    bot.database.query(`INSERT INTO guild_welcome(guild_id,channel_id,embed) VALUES("${msg.guild.id}","${channel.id}","${embed}") \n`
                      +`ON DUPLICATE KEY UPDATE channel_id = "${channel.id}", embed = "${embed}"`);

    let welcome = await bot.database.getGuildWelcome(msg.guild.id);
    if (welcome) {
      console.log(welcome);
      console.log(welcome.embed);
      let welcomeChannel = await msg.guild.channels.cache.get(welcome.channel_id);
      let embed = await bot.utils.tagReplacer(await msg.guild.members.fetch(msg.author.id),msg.guild,welcome.embed);
      console.log(embed);
      let jsonObj = JSON.parse(embed);
      jsonObj.plainText = "Example Welcome Message:"
      msg.channel.send({embed: jsonObj});
    } else {
      channel.send("**There was an error in your command, please check and try again**")
    }
  }
}

module.exports = welcome;
