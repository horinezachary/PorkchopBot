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
      console.log(welcome.embed);
      let welcomeChannel = await member.guild.channels.cache.get(welcome.channel_id);
      let embed = await bot.utils.tagReplacer(member,member.guild,welcome.embed);
      let jsonObj = JSON.parse(embed);
      welcomeChannel.send({embed: jsonObj});
    }

    //create accounts if they don't already exist
    this.database.query(`INSERT IGNORE INTO guild_member_account(user_id,guild_id) VALUES("${member.id}","${member.guild.id}")`);
    this.database.query(`INSERT IGNORE INTO global_user_account(user_id) VALUES("${member.id}")`);
  }

  //invites
  let invites = await bot.utils.parseInvites(member.guild);
  let cachedInvites = await bot.inviteCache.find(inv => {return inv.guild_id == member.guild.id});
  for (let invite of invites) {
    let cacheInv = cachedInvites.find(inv => {return inv.code == invite.code});
    //todo: this
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
