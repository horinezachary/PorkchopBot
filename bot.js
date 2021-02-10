const CLIENT_TOKEN = require('./config.js').CLIENT_TOKEN;
const OVERLORD_ID = require('./config.js').OVERLORD_ID;
const PREFIX = require('./config.js').PREFIX;
const DEFAULT_EMBED_COLOR = "FF6600";
const BOT_ID = require('./config.js').BOT_ID;

console.log("NODE VERSION: " + process.version);

const {Client, Collection} = require('discord.js');
const Database = require("./database.js");
const path = require("path");
const klaw = require("klaw");

class PorkchopBot extends Client {
  constructor(options) {
    super(options);

    this.config = require("./config.js");
    this.logger = require("./util/logger");
    this.utils = require("./util/utils");
    this.commands = new Collection();
    this.events = new Collection();
    this.aliases = new Collection();
    this.ratelimits = new Collection();

    this.apis = {};

    this.database = new Database(this.config.database);

    this.loadCommand = (commandPath, commandName) => {
      try {
        const props = new (require(`${commandPath}${path.sep}${commandName}`))(this);
        // this.logger.log(`Loading Command: ${props.help.name}. 👌`, "log");
        props.conf.location = commandPath;
        props.help.category = this.utils.getType(commandPath);
        if (props.init) {
          props.init(this);
        }
        this.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
          this.aliases.set(alias, props.help.name);
        });
        return false;
      } catch (e) {
        return `Unable to load command ${commandName}: ${e}`;
      }
    };

    this.permlevel = msg => {
      let permlvl = 0;
    }

    this.unloadCommand = async (commandPath, commandName) => {
      let command;
      if (bot.commands.has(commandName)) {
        command = bot.commands.get(commandName);
      } else if (bot.aliases.has(commandName)) {
        command = bot.commands.get(bot.aliases.get(commandName));
      }
      if (!command)
        return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;

      if (command.shutdown) {
        await command.shutdown(bot);
      }
      delete require.cache[
        require.resolve(`${commandPath}${path.sep}${commandName}.js`)
      ];
      return false;
    };
  }
}

const bot = new PorkchopBot({fetchAllMambers: true});

const init = async () => {
  const commandList = [];
  klaw("./commands")
    .on("data", item => {
      const cmdFile = path.parse(item.path);
      if (!cmdFile.ext || cmdFile.ext !== ".js") return;
      const response = bot.loadCommand(
        cmdFile.dir,
        `${cmdFile.name}${cmdFile.ext}`
      );
      commandList.push(cmdFile.name);
      if (response) bot.logger.error(response);
    })
    .on("end", () => {
      bot.logger.log(`Loaded ${commandList.length} commands.`);
    })
    .on("error", error => bot.logger.error(error));

  const eventList = [];
  klaw("./events")
    .on("data", item => {
      const eventFile = path.parse(item.path);
      if (!eventFile.ext || eventFile.ext !== ".js") return;
      const eventName = eventFile.name.split(".")[0];
      try {
        const event = new (require(`${eventFile.dir}${path.sep}${
          eventFile.name
          }${eventFile.ext}`))(bot);
        eventList.push(event);
        bot.events.set(eventName, event);
        bot.on(eventName, (...args) => event.run(bot, ...args));
        delete require.cache[
          require.resolve(
            `${eventFile.dir}${path.sep}${eventFile.name}${eventFile.ext}`
          )
        ];
      } catch (error) {
        bot.logger.error(`Error loading event ${eventFile.name}: ${error}`);
      }
    })
    .on("end", () => {
      bot.logger.log(`Loaded ${eventList.length} events.`);
    })
    .on("error", error => bot.logger.error(error));

  bot.logger.log("Connecting...");
  bot.login(require('./config.js').CLIENT_TOKEN).then(() => {
    bot.logger.debug(`Bot init complete.`)
  });
};

init();

bot.on("disconnect", () => bot.logger.warn("Bot is disconnecting..."));
bot.on("reconnect", () => bot.logger.log("Bot reconnecting..."));
bot.on("error", e => bot.logger.error(e));
bot.on("warn", info => bot.logger.warn(info));

process.on("unhandledRejection", function (err, promise) {
    console.error("Unhandled rejection:\n", promise, "\n\nReason:\n", err);
});
