const Command = require(`${process.cwd()}/base/Command.js`);
const Discord = require("discord.js");

class prefix extends Command {
  constructor(client) {
    super(client, {
      name: "prefix",
      description: "Update the server prefix!",
      usage: "prefix <newPrefix>",
      aliases: [],
      permRequired: "MANAGE_GUILD",
      guildOnly: true
    });
  }

  async run(bot, msg, args, level) {
    let prefixes = await bot.utils.getPrefixes(bot, msg.guild);
    console.log(prefixes);
    let currentPrefix = prefixes[0];
    console.log(currentPrefix);
    let description = "The current prefix is `"+currentPrefix+"`."
    if (args[0]) {
      await bot.database.query(`INSERT INTO guild(guild_id,prefix) VALUES("${msg.guild.id}","${args[0]}") \n`
                      +`ON DUPLICATE KEY UPDATE prefix = "${args[0]}"`);
      let newPrefix = await bot.utils.getPrefixes[0];
      if (currentPrefix != newPrefix) {
        description = "The prefix has been changed from `"+currentPrefix+"` to `"+newPrefix+"`.";
      }
    }
    msg.reply(new Discord.MessageEmbed()
      .setAuthor("Prefix", bot.user.avatarURL())
      .setColor(bot.config.DEFAULT_EMBED_COLOR)
      .setFooter(msg.author.username, msg.author.avatarURL())
      .setTimestamp()
      .setDescription(description)
    );
  }
}

module.exports = prefix;
