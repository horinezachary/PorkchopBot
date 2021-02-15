class Database {
  constructor(cfg) {
    this.pool = require('mysql').createPool(cfg);

    //called with: const [results] = await asyncQuery(query, [sourceName, 0]);
    this.query = function (query, values) {
      return new Promise((resolve, reject) => {
        this.pool.query(query, values, (error, results, fields) => {
          if (error) {
            reject(error);
          }
          resolve([results, fields]);
        });
      });
    };

    this.getPrefix = async (guild_id) => {
      let prefixes = [];
      let [guildLines] = await this.query(`SELECT * FROM guild WHERE guild_id = '${guild_id}'`);
      if (guildLines) {
        for (guild of guildLines) {
          prefixes.push(guild.prefix);
        }
        return prefixes;
      } else {
        return false;
      }
    };

    this.getBotStaff = async (user_id) => {
      let [botStaff] = await this.query(`SELECT * FROM botStaff WHERE user_id = '${user_id}'`);
      if (!botStaff) {
        return false;
      } else {
        return botStaff[0];
      }
    };

    this.isBlacklisted = async (guild_id, user_id) => {
      let [blacklist] = await this.query(`SELECT * FROM blacklist WHERE user_id = '${user_id}' AND scope = 'GLOBAL' & (scope = 'GUILD' AND guild_id = '${guild_id}')`);
      if (!blacklist) {
        return false;
      } else {
        return blacklist;
      }
    };

    this.newEmbed = async (guild_id, channel_id, message_id) => {
      this.query(`INSERT INTO embeds(guild_id,channel_id,message_id) VALUES('${guild_id}','${channel_id}','${message_id}')`);
    }

    this.getGuildWelcome = async (guild_id) => {
      let [welcome] = await this.query(`SELECT * FROM guild_welcome WHERE guild_id = '${guild_id}'`);
      if (!welcome) {
        return false;
      } else {
        return welcome[0];
      }
    };
  }
}

module.exports = Database;
