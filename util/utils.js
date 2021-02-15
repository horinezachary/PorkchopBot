exports.getDiff = function () {
  return {
    VALUE_CREATED: 'created',
    VALUE_UPDATED: 'updated',
    VALUE_DELETED: 'deleted',
    VALUE_UNCHANGED: 'unchanged',
    map: function(obj1, obj2) {
      if (this.isFunction(obj1) || this.isFunction(obj2)) {
        throw 'Invalid argument. Function given, object expected.';
      }
      if (this.isValue(obj1) || this.isValue(obj2)) {
        return {
          type: this.compareValues(obj1, obj2),
          data: obj1 === undefined ? obj2 : obj1
        };
      }

      var diff = {};
      for (var key in obj1) {
        if (this.isFunction(obj1[key])) {
          continue;
        }

        var value2 = undefined;
        if (obj2[key] !== undefined) {
          value2 = obj2[key];
        }

        diff[key] = this.map(obj1[key], value2);
      }
      for (var key in obj2) {
        if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
          continue;
        }

        diff[key] = this.map(undefined, obj2[key]);
      }

      return diff;

    },
    compareValues: function (value1, value2) {
      if (value1 === value2) {
        return this.VALUE_UNCHANGED;
      }
      if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
        return this.VALUE_UNCHANGED;
      }
      if (value1 === undefined) {
        return this.VALUE_CREATED;
      }
      if (value2 === undefined) {
        return this.VALUE_DELETED;
      }
      return this.VALUE_UPDATED;
    },
    isFunction: function (x) {
      return Object.prototype.toString.call(x) === '[object Function]';
    },
    isArray: function (x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    },
    isDate: function (x) {
      return Object.prototype.toString.call(x) === '[object Date]';
    },
    isObject: function (x) {
      return Object.prototype.toString.call(x) === '[object Object]';
    },
    isValue: function (x) {
      return !this.isObject(x) && !this.isArray(x);
    }
  }
}();

exports.cleanAvatarURL = function (URL) {
  return URL.replace(/.webp$/g, ".png").replace(/.gif$/g, ".png");
};

exports.validateURL = function (textval) {
  var urlregex = /^(https?):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(textval);
};

exports.getType = function (filepath) {
  while (filepath.indexOf("/") > -1 || filepath.indexOf("\\") > -1) {
    if (filepath.indexOf("/") > -1)
      filepath = filepath.substring(filepath.indexOf("/") + 1, filepath.length);
    else if (filepath.indexOf("\\") > -1)
      filepath = filepath.substring(
        filepath.indexOf("\\") + 1,
        filepath.length
      );
  }
  return filepath;
};

exports.tagReplacer = async function (member, guild, embed) {
  guild.owner = await guild.members.fetch(guild.ownerID);
  let tags = {
    server: {
      memberCount: guild.memberCount,
      id: guild.id,
      name: guild.name,
      icon: "https://cdn.discordapp.com/icons/"+guild.id+"/"+guild.icon + ".png?size=512",
      splash: "https://cdn.discordapp.com/splashes/"+guild.id+"/"+guild.splash+".png?size=2048",
      banner: "https://cdn.discordapp.com/banners/"+guild.id+"/"+guild.banner+".png?size=1024",
      discoverySplash: "https://cdn.discordapp.com/discovery-splashes/"+guild.id+"/"+guild.discoverySplash+".png?size=1280",
      region: guild.region,
      shardID: guild.shardID,
      owner: {
        id: guild.owner.user.id,
        tag: guild.owner.user.username+"#"+guild.owner.user.discriminator,
        mention: "<@"+guild.owner.user.id+">",
        username: guild.owner.user.username,
        discriminator: guild.owner.user.discriminator,
        bot: guild.owner.user.bot,
        avatar: "https://cdn.discordapp.com/avatars/"+guild.owner.user.id+"/"+guild.owner.user.avatar+".png?size=512"
      }
    },
    member: {
      id: member.user.id,
      tag: member.user.username+"#"+member.user.discriminator,
      mention: "<@"+member.user.id+">",
      username: member.user.username,
      discriminator: member.user.discriminator,
      bot: member.user.bot,
      avatar: "https://cdn.discordapp.com/avatars/"+member.user.id+"/"+member.user.avatar+".png?size=512"
    },
    timestamp: new Date().getTime()
  }
  if (guild.icon == null) {
    tags.server.icon = "";
  }
  if (guild.banner == null) {
    tags.server.banner = "";
  }
  if (guild.splash == null) {
    tags.server.splash = "";
  }
  if (guild.discoverySplash == null) {
    tags.server.discoverySplash = "";
  }
  embed = embed.replace(/\{\{member.([a-zA-Z]*)\}\}/g,(match,p1) => {return tags.member[p1];});
  embed = embed.replace(/\{\{server.([a-zA-Z]*)\}\}/g,(match,p1) => {return tags.server[p1];});
  embed = embed.replace(/\{\{server.owner.([a-zA-Z]*)\}\}/g,(match,p1) => {return tags.server.owner[p1];});
  embed = embed.replace(/\{\{(timestamp)\}\}/g,(match,p1) => {return tags[p1];});
  return embed;
};
exports.getPermission = async (bot,author,guild,permRequired) => {
  let permission = false;
  if (permRequired == false || permRequired == "USER") { //no perms required
    permission = "USER";
  } else if (permRequired == "BOTADMIN") {
    let staffUser = await bot.database.getBotStaff(author.id);
    if (staffUser && (staffUser.role == "BOTADMIN" || staffUser.role == "BOTOWNER")) {
      permission = "BOTADMIN";
    } else {
      let overlord = await bot.users.fetch(bot.config.OVERLORD_ID);
      let message = (`This command is reserved for <@${bot.user.id}> global admins only. If you think this is an error, please contact **${overlord.username}#${overlord.discriminator}**.`);
      console.log("return false");
      return {valid: false, message: message};
    }
  } else if (permRequired == "BOTOWNER") {
    let staffUser = await bot.database.getBotStaff(author.id);
    if (staffUser && staffUser.role == "BOTOWNER") {
      permission = "BOTOWNER";
    } else {
      let overlord = await bot.users.fetch(bot.config.OVERLORD_ID);
      let message = (`This command is reserved for <@${bot.user.id}>'s owner only. If you think this is an error, please contact **${overlord.username}#${overlord.discriminator}**.`);
      console.log("return false");
      return {valid:false, message: message};
    }
  } else if (await guild.member(author).hasPermission(permRequired)) {
    permission = permRequired;
  } else {
    let message = (`You do not have the required permissions to run this command: **${permRequired}**`);
    console.log("return false");
    return {valid: false, message: message};
  }
  console.log("return true");
  return {valid: true, level: permission}
}

exports.getPrefixes = async (bot,guild) => {
  let prefixes = await bot.database.getPrefix(guild.id);
  if (prefixes == false) {
    prefixes = [bot.config.PREFIX];
  }
  prefixes.push(`<@!${bot.user.id}>`);
  return prefixes;
}
