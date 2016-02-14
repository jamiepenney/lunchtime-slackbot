var db = require('../db');
var escapeStringRegexp = require('escape-string-regexp');

function conversation(bot, user, message) {
  bot.startPrivateConversation(message, function(err, conversation){
    db.getUser(user.name, function(err, lunchtimeUser){
      if(err || !lunchtimeUser){
        console.log(err);
        conversation.say("Sorry, I can't seem to find you in the lunchtime system.")
        conversation.next();
        return;
      }

      db.getChoices(function(err, choices){
        if(err) {
          console.log(err);
          conversation.say("Couldn't load the lunch list!");
          conversation.next();
          return;
        }
        conversation.say("The choices available are:");
        conversation.say(
          choices.map(function(choice, index) {
            return (index+1) + '. ' + choice.name;
          }).join('\n'));

        var choiceResponses = choices.map(function(choice, index){
          return {
            pattern: new RegExp('(^' + (index+1) + '$)|('+escapeStringRegexp(choice.name) + ')', 'gi'),
            callback: function(response, convo) {
              db.makeVote(lunchtimeUser, choice, function(err){
                if(err){
                  console.log(err);
                  convo.say("Error: Couldn't save your vote!");
                  convo.next();
                  return;
                }
                convo.say('Great! Your vote for ' + choice.name + ' has been cast.');
                convo.next();
              })
            }
          };
        }).concat([{
          pattern: 'stop',
          callback: function(response, convo){
            convo.say('Never mind then...');
	          convo.next();
          }
        },{
          default: true,
          callback: function(response, convo){
            convo.repeat();
	          convo.next();
          }
        }]);

        conversation.ask('What do you want for lunch? (say the number or the name of the place, or cancel to stop)', choiceResponses);
      });
    });
  });
}

module.exports = {
  conversation: conversation
};
