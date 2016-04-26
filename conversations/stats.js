var db = require('../db');
var Table = require('easy-table')

function statsConversation(bot, user, message) {
  bot.startConversation(message, function(err, conversation){
    db.getLastRoundStats(function(err, stats){
      if(err) {
        console.log(err);
        conversation.say("Sorry, I'm having a bit of trouble getting data from the lunchtime system.")
        conversation.next();
        return;
      }
      if(stats.length === 0) {
        conversation.say('No one voted!');
        conversation.next();
        return;
      }
      conversation.say('Stats for last round of voting:')
      var t = new Table();
      
      var statsMessage = stats.forEach(function(stat) {
        t.cell('Votes', stat.votes);
        t.cell('Choice', stat.choice);
        t.newRow();
      });
      t.sort(['Votes|des'])
      conversation.say(t.toString());
    });
  })
};

module.exports = {
  conversation: statsConversation
}
