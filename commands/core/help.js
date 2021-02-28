const Command = require(`${process.cwd()}/base/Command.js`);
const Discord = require("discord.js");

class help extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "View a list of the bot's commands and what they do!",
      usage: "help <optional-command-name>",
      aliases: ["h"],
      permRequired: "USER"
    });
  }

  async run(bot, msg, args, level) {
    let prefix = await bot.utils.getPrefixes(bot, msg.guild);
    prefix = prefix[0];
    let perms = [];
    for (let c of bot.commands) {
      let perm = await bot.utils.getPermission(bot,msg.author,msg.guild,c[1].conf.permRequired);
      if(perm.valid){
        perms.push(c[1].conf.permRequired);
      } else {
      }
    }
    if (!args[0]) {
      try {
        let myCommands = bot.commands.filter((c) => {
          return perms.includes(c.conf.permRequired);
        });
        var help = new Discord.MessageEmbed()
          .setAuthor(
            bot.user.username + " Help | " + myCommands.size + " Commands",
            bot.user.avatarURL()
          )
          .setColor(msg.color)
          .setDescription(
            "**My prefix for this server is `" +
            prefix +
            "`.**" +
            "\n\nFor details regarding a specific command, use " +
            prefix +
            "help <command-name>."
          )
          .setTimestamp()
          .setFooter(bot.user.username + " Help");

        let currentCategory = "";
        let output = ``;
        const sorted = myCommands.array().sort((p, c) => {
          p.type = getType(p.conf.location);
          c.type = getType(c.conf.location);
          return p.type > c.type
            ? 1
            : p.name > c.name && p.type === c.type
              ? 1
              : -1;
        });
        sorted.forEach(c => {
          const cat = toProperCase(getType(c.conf.location));
          if (currentCategory !== cat && currentCategory !== ``) {
            help.addField(currentCategory + " Commands:", output);
            output = "";
            currentCategory = cat;
          } else if (currentCategory !== cat) {
            currentCategory = cat;
          }
          output += `\`\`${c.help.name}\`\` `;
        });
        help.addField(currentCategory + " Commands:", output);
        if (msg.channel.permissionsFor(msg.guild.me).has("EMBED_LINKS")) {
          msg.channel.send(help);
        } else {
          msg.author.send(help);
        }
      } catch (error) {
        bot.logger.error(error);
      }
    } else {
      let command = args[0];
      if (
        bot.commands.has(command) ||
        bot.commands.has(bot.aliases.get(command))
      ) {
        command =
          bot.commands.get(command) ||
          bot.commands.get(bot.aliases.get(command));
        if (command.conf.permLevel > bot.permlevel(msg)) return;
        var helpCommand = new Discord.MessageEmbed();
        command.type = getType(command.conf.location);
        helpCommand
          .setTitle(toProperCase(command.help.name) + " Command")
          .setFooter(bot.user.username + " Help")
          .setTimestamp()
          .addField("Category", `${toProperCase(command.type)}`, true)
          .addField("Description", `${command.help.description}`, true)
          .addField("Usage", `${msg.prefix}${command.help.usage}`, true)
          .setColor(msg.color);
        if (command.conf.aliases.length > 0) {
          helpCommand.addField(
            "Aliases",
            `${command.conf.aliases.join(", ")}`,
            true
          );
        }
        msg.channel.send({ embed: helpCommand });
      }
    }

    function toProperCase(m) {
      return m.replace(/([^\W_]+[^\s-]*) */g, txt => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }

    function getType(filepath) {
      while (filepath.indexOf("/") > -1 || filepath.indexOf("\\") > -1) {
        if (filepath.indexOf("/") > -1)
          filepath = filepath.substring(
            filepath.indexOf("/") + 1,
            filepath.length
          );
        else if (filepath.indexOf("\\") > -1)
          filepath = filepath.substring(
            filepath.indexOf("\\") + 1,
            filepath.length
          );
      }
      return filepath;
    }
  }
}

module.exports = help;
