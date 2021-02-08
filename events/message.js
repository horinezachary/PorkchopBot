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

    let prefixes = await bot.database.getPrefix(msg.guild.id);
    if (prefixes == false) {
      prefixes = [bot.config.PREFIX];
    }
    prefixes.push(`<@!${bot.user.id}>`);

    for (let prefix of prefixes) {
      if (msg.content.toLowerCase().startsWith(prefix)) {
        msg.prefix = prefix;
      }
    }

    if (!msg.prefix) return; //no prefix found

    const args = msg.content
      .slice(msg.prefix.length)
      .trim()
      .split(/ +/g);
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
        response += ` for ${reason}`;
      }
      msg.reply(response + ".");
      return;
    }

    let permission = false;
    if (cmd.conf.permRequired == false) { //no perms required
      permission = "USER";
    } else if (cmd.conf.permRequired == "BOTADMIN") {
      let staffUser = await bot.database.getBotStaff(msg.author.id);
      if (staffUser && (staffUser.role == "BOTADMIN" || staffUser.role == "BOTOWNER")) {
        permission = "BOTADMIN";
      } else {
        let overlord = await bot.users.fetch(bot.config.OVERLORD_ID);
        msg.reply(`This command is reserved for <@${bot.user.id}> global admins only. If you think this is an error, please contact **${overlord.username}#${overlord.discriminator}**.`);
        return;
      }
    } else if (cmd.conf.permRequired == "BOTOWNER") {
      let staffUser = await bot.database.getBotStaff(msg.author.id);
      if (staffUser && staffUser.role == "BOTOWNER") {
        permission = "BOTOWNER";
      } else {
        let overlord = await bot.users.fetch(bot.config.OVERLORD_ID);
        msg.reply(`This command is reserved for <@${bot.user.id}>'s owner only. If you think this is an error, please contact **${overlord.username}#${overlord.discriminator}**.`);
        return;
      }
    } else if (await msg.guild.member(msg.author).hasPermission(cmd.conf.permRequired)) {
      permission = cmd.conf.permRequired;
    } else {
      msg.reply(`You do not have the required permissions to run this command: **${cmd.conf.permRequired}**`);
      return;
    }

    msg.flags = [];
    while (args[0] && args[0][0] === '-') {
      msg.flags.push(args.shift().slice(1));
    }

    bot.logger.log(`${cmd.conf.permRequired}: ${msg.author.username} (${msg.author.id}) ran command ${cmd.help.name}`,'cmd');

    cmd.run(bot, msg, args, permission).catch(err => {
      msg.channel.send(
        "You shouldn't ever get this message. Please contact **" +
        bot.users.cache.get(bot.config.OVERLORD_ID).tag +
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
