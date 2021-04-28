module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run (bot, msg) {
    if (!msg.guild && msg.channel.type == 'dm') {
      bot.logger.log(
        `[DM] ${msg.channel.recipient.username} | ${msg.author.username} -> ${msg.content}`
      );
    }

    if (msg.author.bot || !msg.guild) return; //message comes from another bot or is not a guild message

    bot.logger.log(`${msg.guild.name} - #${msg.channel.name} | ${msg.author.username} -> ${msg.content}`);

    if (!msg.channel.permissionsFor(msg.guild.me).has('SEND_MESSAGES')) return;

    let prefixes = await bot.utils.getPrefixes(bot, msg.guild);

    for (let prefix of prefixes) {
      if (msg.content.toLowerCase().startsWith(prefix)) {
        msg.prefix = prefix;
      }
    }

    if (!msg.prefix) return; //no prefix found

    //const args = msg.content.slice(msg.prefix.length).trim().split(/ +/g);

    const args = await bot.utils.getArgs(msg.prefix,msg.content);
    const command = args.shift().toLowerCase();
    const cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
    if (!cmd) return;

    let blacklisted = await bot.database.isBlacklisted(msg.guild.id,msg.author.id);
    if (blacklisted != false) {
      let response = `You have been banned from using the bot`
      if (blacklisted.scope == "GUILD") {
        response += ` in this server`;
      } else if(blacklisted.scope == "GLOBAL") {
        response += ` globally`;
      }
      let mod = await bot.users.fetch(blacklisted.moderator);
      response += ` by ${mod.tag}`;
      if (blacklisted.reason != "") {
        response += ` for ${blacklisted.reason}`;
      }
      msg.reply(response + ".");
      return;
    }

    let permission = await bot.utils.getPermission(bot, msg.author, msg.guild, cmd.conf.permRequired);
    if (!permission.valid) {
      msg.reply(permission.message);
      return;
    } else {
      permission = permission.level;
    }

    msg.flags = [];
    while (args[0] && args[0][0] === '-') {
      msg.flags.push(args.shift().slice(1));
    }

    bot.logger.log(`${cmd.conf.permRequired}: ${msg.author.username} (${msg.author.id}) ran command ${cmd.help.name}`,'cmd');

    cmd.run(bot, msg, args, permission).catch(err => {
      msg.channel.send(
        "You shouldn't ever get this message. Please contact **" +
        bot.config.OVERLORD_USERNAME +
        '** with this error:\n```LDIF\n' + err.stack +'```');
    });

    /*
    if (message.content.startsWith(PREFIX+"embed")  && hasPermission(message.channel, message.author)) {
      let jsonString = message.content.substr(message.content.indexOf("{"), message.content.lastIndexOf("}"));
      let jsonObj = JSON.parse(jsonString);
      message.channel.send({embed:jsonObj});
    }
    */

  };
}
