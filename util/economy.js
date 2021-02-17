class Economy {
  constructor(bot,database) {
    this.bot = bot;
    this.database = database;
    this.GLOBAL_DAILY = bot.config.economy.GLOBAL_DAILY;
  }

  async getGuildEconomyMode(guild_id) {
    let [mode] = await this.database.query(`SELECT * FROM guild WHERE guild_id = "${guild_id}"`);
    if (mode.length > 0) {
      return mode[0].guild_economy_mode;
    } else {
      await this.database.query(`INSERT IGNORE INTO guild(guild_id,prefix) VALUES("${guild_id}","${this.bot.config.PREFIX}")`);
      return "GLOBAL";
    }
  }

  async getBal(guild_id,user_id) {
    let mode = await this.getGuildEconomyMode(guild_id);
    if (mode == "GUILD") {
      let [user] = await this.database.query(`SELECT * FROM guild_member_account WHERE user_id = "${user_id}" AND guild_id = "${guild_id}"`);
      if (user.length < 1) {
        await this.database.query(`INSERT IGNORE INTO guild_member_account(user_id,guild_id) VALUES("${user_id}","${guild_id}")`);
        return 0;
      } else {
        return user[0].bank;
      }
    } else if(mode == "GLOBAL") {
      let [user] = await this.database.query(`SELECT * FROM global_user_account WHERE user_id = "${user_id}"`);
      if (user.length < 1) {
        await this.database.query(`INSERT IGNORE INTO global_user_account(user_id) VALUES("${user_id}")`);
        return 0;
      } else {
        return user[0].bank;
      }
    } else {
      console.log(mode);
    }
  }

  async getBalTop(guild_id, start, end) {
    let mode = await this.getGuildEconomyMode(guild_id);
    if (mode == "GUILD") {
      let [users] = await this.database.query(`SELECT * FROM guild_member_account WHERE guild_id = "${guild_id}" AND bank != 0 ORDER BY bank DESC LIMIT ${start},${end}`);
      return users;
    } else if(mode == "GLOBAL") {
      let [users] = await this.database.query(`SELECT * FROM guild_member_account JOIN global_user_account
                          WHERE guild_member_account.user_id = global_user_account.user_id
                          AND guild_member_account.guild_id = "${guild_id}"
                          AND global_user_account.bank != 0 ORDER BY global_user_account.bank DESC LIMIT ${start},${end}`);
      return users;
    }
  }

  async addBal(guild_id,user_id, amount) {
    let userBal = await this.getBal(guild_id,user_id);
    let newBal = userBal + amount;
    let mode = await this.getGuildEconomyMode(guild_id);
    if (mode == "GUILD") {
      let [user] = await this.database.query(`SELECT * FROM guild_member_account WHERE user_id = "${user_id}" AND guild_id = "${guild_id}"`);
      if (user.length < 1) {
        await this.database.query(`INSERT IGNORE INTO guild_member_account(user_id,guild_id,bank) VALUES("${user_id}","${guild_id}",${newBal})`);
        return newBal;
      } else {
        return newBal;
      }
    } else if(mode == "GLOBAL") {
      let [user] = await this.database.query(`INSERT INTO global_user_account(user_id,bank) VALUES ("${user_id}",${newBal}) ON DUPLICATE KEY UPDATE bank = ${newBal}`);
      if (user.length < 1) {
        await this.database.query(`INSERT IGNORE INTO global_user_account(user_id) VALUES("${user_id}",${newBal})`);
        return newBal;
      } else {
        return newBal;
      }
    }
  }

  async subBal(guild_id, user_id, amount) {
    return this.addBal(guild_id,user_id,0-amount);
  }

  async pay(guild_id, user_id_from, user_id_to, amount) {
    let fromBal = await this.getBal(guild_id, user_id_from);
    let toBal = await this.getBal(guild_id, user_id_to);
    if (this.getGuildEconomyMode(guild_id) == "GUILD" && bot.util.inGuild(user_id_from) && bot.util.inGuild(user_id_to)) {
      return {message: "Recieving user is not in guild"};
    } else if (fromBal < amount){
      return {message: "Sending user doesn't have enough money.\nBalance: `"+fromBal+"`"};
    } else {
      this.addBal(guild_id, user_id_to, amount);
      this.subBal(guild_id, user_id_from, amount);
      return true;
    }
  }
}

module.exports = Economy;
