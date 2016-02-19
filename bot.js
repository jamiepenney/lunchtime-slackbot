var SlackClient = require('slack-client');
var config = require('./config')
var token = require('./conversations/token');
var vote = require('./conversations/vote');
var db = require('./db');
var request = require('request');

var slack = new SlackClient.WebClient(config.slackToken);

var botUserId;

var users = [];

function getUser(userId, cb){
  if(users[userId]) {
    cb(null, users[userId]);
    return;
  }

  slack.users.info(userId, function(err, user){
    if(!err && user.ok) {
      users[userId] = user.user;
    }
    cb(err, user ? user.user : null);
  });
}

function randomResponse(responses){
  return responses[Math.floor(Math.random() * responses.length)];
}

var Botkit = require('botkit');
var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: config.slackToken
});

///////////////////////
/// Token Responses ///
///////////////////////

controller.hears(["token"],["direct_mention", "mention"],function(bot,message) {
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    bot.reply(message, 'Check your PMs ' + (user.profile.real_name || user.name));
    token.conversation(bot, user, message);
  })
});

controller.hears(["token"],["direct_message"],function(bot,message) {
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    token.conversation(bot, user, message);
  })
});

//////////////////////
/// Vote Responses ///
//////////////////////

controller.hears(["vote"],["direct_mention", "mention"],function(bot,message) {
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    bot.reply(message, 'Check your PMs for voting instructions ' + (user.profile.real_name || user.name));
    vote.conversation(bot, user, message, true);
  })
});

controller.hears(["vote"],["direct_message"],function(bot,message) {
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    vote.conversation(bot, user, message, true);
  })
});


///////////////////////
/// Hungry response ///
///////////////////////

var notTodayResponses = ['Sorry friend not much I can do about that today!', "I'm sorry Dave, I'm afraid I can't do that", "Not today peeps"]

controller.hears(["hungry", "lunch"],["direct_message","direct_mention", "mention"],function(bot,message) {
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    db.getCurrentRound(function(err, current_round){
      if(err) {
        return;
      }
      if(current_round && current_round.winning_choice_id) {
        bot.reply(message, randomResponse(notTodayResponses));
      } else {
        bot.reply(message, 'If you want to vote for lunch, just say vote');
      }
    })

  });
});


/////////////////////
/// Help response ///
/////////////////////

controller.hears(["help"],["direct_message","direct_mention", "mention"],function(bot,message) {
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    bot.startConversation(message, function(err, conversation){
      conversation.say('Hello ' + (user.profile.real_name || user.name));
      conversation.say('I understand the following commands:');
      conversation.say('`hello`: Says hello to you');
      conversation.say('`token`: Sends you a private message with your token for voting on the website, and lets you change it');
      conversation.say('`vote`: Starts the voting process');
    });
  });
});


//////////////////////
/// Hello response ///
//////////////////////

controller.hears(["hello", "hi", "hey"],["direct_message","direct_mention", "mention"],function(bot,message) {
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    bot.reply(message, 'Hello ' + (user.profile.real_name || user.name));
  });
});

controller.hears(['.*'], ["direct_message","direct_mention", "mention"], function(bot, message){
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    request('http://catfacts-api.appspot.com/api/facts', function (err, response, body){
      if(err || response.statusCode !== 200) {
        console.log(err || response);
        return;
      }
      var facts = JSON.parse(body);
      if(facts && facts.success){
        bot.startConversation(message, function(err, conversation){
          conversation.say('Hello ' + (user.profile.real_name || user.name));
          conversation.say('Thank you for subscribing to cat facts');
          conversation.say(facts.facts[0]);
        });
      }
    })
  })
});

///////////////
/// Exports ///
///////////////

module.exports = {
  start: function() {
    // Start the real time messaging listener
    bot.startRTM(function(err,bot,payload) {
      if (err) {
        throw new Error('Could not connect to Slack');
      }
    });
  }
};
