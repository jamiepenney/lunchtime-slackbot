var db = require('../db');

function makeNewToken()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function tokenConversation(bot, user, message) {
  bot.startPrivateConversation(message, function(err, conversation){
    db.getUser(user.name, function(err, lunchtimeUser){
      if(err || !lunchtimeUser){
        conversation.say("Sorry, I can't seem to find you in the lunchtime system.")
        conversation.stop();
        return;
      }

      conversation.say('Your current token is `' + lunchtimeUser.token + '`');
      conversation.ask('Would you like to change it?', [{
        pattern: bot.utterances.yes,
        callback: function(response, convo) {
          var newToken = makeNewToken();

          db.saveToken(lunchtimeUser, newToken, function(err){
            if(err){
              convo.say("Error: Couldn't save your new token!");
              convo.next();
              return;
            }
            convo.say('Great! Your new token is `' + newToken + '`');
            convo.next();
          })
        }
      },
      {
        default: true,
        callback: function(response, convo){
          convo.say('Never mind then...');
          convo.next();
        }
      }])
    })
  });
};

module.exports = {
  conversation: tokenConversation
}
