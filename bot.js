var SlackClient = require('slack-client');
var config = require('./config')

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

var Botkit = require('botkit');
var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: config.slackToken
});

controller.hears(["hello"],["direct_message","direct_mention", "mention"],function(bot,message) {
  // do something to respond to message
  // all of the fields available in a normal Slack message object are available
  // https://api.slack.com/events/message
  getUser(message.user, function(err, user){
    if(err){
      return;
    }
    bot.reply(message,'Hello ' + user.realName);
  })
});

module.exports = {
  start: function() {
    // join the default slack channel
    slack.channels.join(config.slackRoom);

    // Start the real time messaging listener
    bot.startRTM(function(err,bot,payload) {
      if (err) {
        throw new Error('Could not connect to Slack');
      }
    });
  }
};
