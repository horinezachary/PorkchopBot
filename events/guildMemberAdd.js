/*
bot.on('guildMemberAdd', async (member) => {
  let invites = await parseInvites(guild);
  console.log(invites);
  member.guild = [];
  console.log(member);
});
*/


const moment = require("moment");

module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot,member) {

    //welcome
    let welcome = await bot.database.getGuildWelcome(member.guild.id);
    if (welcome) {
      console.log(welcome);
      console.log(welcome.embed);
      let welcomeChannel = await member.guild.channels.cache.get(welcome.channel_id);
      let embed = await bot.utils.tagReplacer(member,member.guild,welcome.embed);
      console.log(embed);
      let jsonObj = JSON.parse(embed);
      welcomeChannel.send({embed: jsonObj});
    }
  }

}


/*
SERVER
  server.memberCount
  server.id
  server.name
  server.icon
  server.splash
  server.region
  server.shardID
  server.banner
  server.discoverySplash

OWNER
  server.owner.id
  server.owner.username
  server.owner.bot
  server.owner.discriminator
  server.owner.tag
  server.owner.avatarURL

MEMBER
  member.id
  member.username
  member.bot
  member.discriminator
  member.tag
  member.avatar
*/
