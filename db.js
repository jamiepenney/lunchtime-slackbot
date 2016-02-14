var config = require('./config.js');
var pg = require('pg');
var cfg = config.pg;

function getUser(slackName, next) {
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }

    var query = 'select * from "user" where slack_username = $1 limit 1';
    client.query({text: query, values: [slackName]}, function(err, result) {
      next(err, result.rows[0]);
      done();
    });
  });
};

function saveToken(user, newToken, next) {
    pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }

    var query = 'update "user" set token = $1 where id = $2';
    client.query({text: query, values: [newToken, user.id]}, function(err, result) {
      next(err);
      done();
    });
  });
}

module.exports = {
  getUser: getUser,
  saveToken: saveToken
};
