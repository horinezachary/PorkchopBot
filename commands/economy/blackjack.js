const Command = require(`${process.cwd()}/base/Command.js`);

class blackjack extends Command {
  constructor(client) {
    super(client, {
      name: "blackjack",
      description: "",
      usage: "blackjack <gamble-amount>",
      aliases: ["bj"],
      permLevel: 1
    });
  }

  restart(player_hand, cpu_hand, cards) {
    player_hand.push(this.drawCard(cards));
    cpu_hand.push(this.drawCard(cards));
    player_hand.push(this.drawCard(cards));
  }

  drawCard(cards) {
    let i = Math.floor(Math.random() * cards.length)
    return cards.splice(i, 1)[0];
  }

  calculateTotal(hand) {
    let total = 0;
    for (var i = 0; i < hand.length; i++) {
      if (hand[i] == "J" || hand[i] == "Q" || hand[i] == "K") {
        total += 10
      } else if (hand[i] == "A") {
        total += 11
      } else {
        total += hand[i]
      }
    }

    for (var i = 0; i < hand.length; i++) {
      if (hand[i] == "A" && total > 21) {
        total -= 10
      }
    }
    return total;
  }

  calculateWinner(player_hand, cpu_hand, cards) {
    //dealer draw - stand on 17
    while (this.calculateTotal(cpu_hand) < 17) {
      cpu_hand.push(this.drawCard(cards));
    }
    let cpu_total = this.calculateTotal(cpu_hand);
    let player_total = this.calculateTotal(player_hand);

    /**
     * note that some of the outcomes represented below are unused but kept in the code architecture
     * for legibility and ease for any future edits
     * 0 dealer bust
     * 1 dealer win
     * 2 player bust
     * 3 player win
     * 4 push
     */
    if (cpu_total > 21) {
      return 0; //on dealer bust
    } else if (player_total > 21) {
      return 2; //unused; on player bust
    } else {
      if (cpu_total > player_total) {
        return 1; //on dealer win
      } else if (cpu_total < player_total) {
        return 3; //on player win
      } else if (cpu_total == player_total) {
        return 4; //on push
      }
    }
  }

  async run(bot, msg, args, level) {
    var amount;
    var cards = [
      "A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K",
      "A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K",
      "A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K",
      "A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"
    ];
    var player_hand = [];
    var cpu_hand = [];
    var timeout = true;

    if (args[0] && isNaN(args[0])) amount = 10;
    else if (args[0] && !isNaN(args[0]) && Number(args[0]) > 0) amount = Number(args[0]);
    else amount = 10;

    let balance = (await bot.economy.getBal(msg.guild.id,msg.author.id)) || {};
    if (!balance || balance == 0)
      return msg.reply(
        "your balance is 0! Please claim your dailies if you are able to do so to play!"
      );
    if (balance < amount)
      return msg.reply("you don't have enough money to cover that bet!");

    this.restart(player_hand, cpu_hand, cards)

    let embed = {
      title: "** Blackjack Bid Amount:** " + amount + " credits",
      description: `Dealer's cards: ${cpu_hand}` +
        `\n<@${msg.author.id}>'s cards: ${player_hand}` +
        `\nPlease react ✌ to hit and 🖐 to stay`,
      footer: {
        text: bot.user.username + " Blackjack",
        iconURL: bot.user.avatarURL()
      },
      timestamp: new Date()
    }

    let blackjackMessage = await msg.channel.send({
      embed: embed
    })
      .then(message => {
        message.react("✌")
        message.react("🖐")
        return message;
      });

    let filter = (reaction, user) => (reaction.emoji.name === '✌' || reaction.emoji.name === "🖐") && user.id === msg.author.id;
    let collector = blackjackMessage.createReactionCollector(filter, { time: 1000 * 3 * 60 })
    collector.on("collect", messageReaction => {
      if (messageReaction.emoji.name === "🖐") {
        let winner = this.calculateWinner(player_hand, cpu_hand, cards)
        if (winner == 0) {
          //dealer busts
          embed.description = `Dealer's cards: ${cpu_hand}` +
          `\n<@${msg.author.id}>'s cards: ${player_hand}` +
          `\nDealer has busted, You win " + 2 * amount + " credits`;
          blackjackMessage.edit({embed: embed});
          bot.economy.addBal(msg.guild.id, msg.author.id, amount);
        } else if (winner == 1) {
          //dealer win
          embed.description = `Dealer's cards: ${cpu_hand}` +
          `\n<@${msg.author.id}>'s cards: ${player_hand}` +
          `\nDealer wins, You lose " + amount + " credits`;
          blackjackMessage.edit({embed: embed});
          bot.economy.subBal(msg.guild.id, msg.author.id, amount);
        } else if (winner == 3) {
          //dealer win
          embed.description = `Dealer's cards: ${cpu_hand}` +
          `\n<@${msg.author.id}>'s cards: ${player_hand}` +
          `\nDealer has busted, You win " + 2 * amount + " credits`;
          blackjackMessage.edit({embed: embed});
          blackjackMessage.edit({
            embed:
            {
              title: "**Blackjack Bid Amount:** " + amount + " credits",
              description: "Dealer's cards: " + cpu_hand +
                "\n<@" + msg.author.id + ">'s cards: " + player_hand +
                "\n" + "Player wins, You win " + 2 * amount + " credits",
              footer: {
                text: bot.user.username + " Blackjack",
                iconURL: bot.user.avatarURL()
              },
              timestamp: new Date()
            }
          });
          bot.economy.addBal(msg.guild.id, msg.author.id, amount*2);
        } else if (winner == 4) {
          //push
          embed.description = `Dealer's cards: ${cpu_hand}` +
          `\n<@${msg.author.id}>'s cards: ${player_hand}` +
          `\nPush! You win back your " + amount + " credits`;
          blackjackMessage.edit({embed: embed});
          //bot.economy.addBal(msg.guild.id, msg.author.id, amount);
          /*
           * account has no change due to push
          */
        } //we can stop here
        timeout = false;
        collector.stop();
      } else if (messageReaction.emoji.name === "✌") {
        player_hand.push(this.drawCard(cards));
        if (this.calculateTotal(player_hand) > 21) {
          blackjackMessage.edit({
            embed:
            {
              title: "**Blackjack Bid Amount:** " + amount + " credits",
              description: "<@" + msg.author.id + "> busted! " + player_hand +
                "\n" + "You lost " + amount + " credits",
              footer: {
                text: bot.user.username + " Blackjack",
                iconURL: bot.user.avatarURL()
              },
              timestamp: new Date()
            }
          });
          bot.economy.subBal(msg.guild.id, msg.author.id, amount);
          timeout = false;
          collector.stop();
        } else {
          embed.description = `Dealer's cards: ${cpu_hand}` +
          `\n<@${msg.author.id}>'s cards: ${player_hand}` +
          `\nPlease react ✌ to hit and 🖐 to stay`
          blackjackMessage.edit({embed: embed});
        }
      }
      let me = messageReaction.users.cache.filter(user => user.username == msg.author.username).first();
      messageReaction.users.remove(me);
    })
    collector.on("end", collected => {
      if (timeout) {
        blackjackMessage.edit({
          embed:
          {
            title: "**Blackjack Bid Amount:** " + amount + " credits",
            description: "You took too long and forfit the match",
            footer: {
              text: bot.user.username + " Blackjack",
              iconURL: bot.user.avatarURL()
            },
            timestamp: new Date()
          }
        });
        bot.economy.subBal(msg.guild.id, msg.author.id, amount);
      }
    })
  }
}

module.exports = blackjack;
