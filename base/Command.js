class Command {
  constructor(
    client,
    {
      name = null,
      description = "No description provided.",
      category = "General",
      usage = "No usage provided.",
      extended = "No information provided.",
      cost = 0,
      cooldown = 0,
      hidden = false,
      guildOnly = false,
      aliases = [],
      permRequired = false,
      premiumTier = false,
      location = ""
    }
  ) {
    this.client = client;
    this.conf = {
      hidden,
      guildOnly,
      aliases,
      permRequired,
      location,
      cooldown,
      category
    };
    this.help = {
      name,
      description,
      category,
      usage,
      extended,
      cost
    };
  }

  async verifyUser(message, user) {
    try {
      const match = /(?:<@!?)?([0-9]{17,20})>?/gi.exec(user);
      if (!match) {
        message.response("❗", "Invalid user id.");
        return false;
      }
      const id = match[1];
      const check = await this.client.users.fetch(id);
      if (check.username !== undefined) return check;
    } catch (error) {
      message.channel.send(error);
    }
    return false;
  }

  async verifyMember(message, member) {
    const user = await this.verifyUser(message, member);
    const target = await message.guild.members.fetch(user);
    return target;
  }

  async verifyMessage(message, msgid) {
    try {
      const match = /([0-9]{17,20})/.exec(msgid);
      if (!match) return "Invalid message id.";
      const id = match[1];
      const check = await message.channel.messages.fetch(id);
      if (check.cleanContent !== undefined) return id;
    } catch (error) {
      message.channel.send(error);
    }
    return false;
  }

  async verifyChannel(message, chanid) {
    try {
      const match = /([0-9]{17,20})/.exec(chanid);
      if (!match) return message.channel.id;
      const id = match[1];
      const check = await message.guild.channels.cache.get(id);
      if (check.name !== undefined && check.type === "text") return id;
    } catch (error) {
      message.channel.send(error);
    }
    return false;
  }

   /*
  async hasPermission(channel, author, permRequired) {
    if (permRequired == false) {
      return true;
    } else {
      let member = channel.guild.members.cache.get(author.id);
      console.log(member.permissions);
      if (member.permissions.has(permission) || member.id == this.client.config.OVERLORD_ID){
        return true;
      }
      return false;
    }
  }
  */

  async run(message, args, level) {
    throw new Error(
      `Command ${this.constructor.name} doesn't provide a run method.`
    );
  }
}
module.exports = Command;
