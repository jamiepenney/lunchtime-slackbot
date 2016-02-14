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

function getCurrentRoundInternal(client, next){
  var roundQuery = 'select * from "round" where is_current = TRUE order by id desc limit 1';
  client.query({text: roundQuery}, function(err, result) {
    next(result.rows.length === 0 ? 'No current round set!' : err, result ? result.rows[0] : null);
  });
}

function getCurrentRound(next){
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    getCurrentRoundInternal(client, next);
  });
}

function getChoices(next){
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }
    getCurrentRoundInternal(client, function(err, round){
      if(err) {
        done();
        return next(err);
      }
      var query = 'select * from "choice" c where (c.added_in is null or c.added_in <= $1) and (c.removed_in is null or c.removed_in >= $1) order by c.id asc';
      client.query({text: query, values: [round.id]}, function(err, result) {
        if(err || result.rows.length === 0) {
          next(err || 'No choices defined!');
          done();
        }
        next(err, result.rows);
        done();
      });
    })
  });
}

function makeVote(user, choice, next){
  pg.connect(cfg, function(err, client, done) {
    if(err) { done(); return next(err); }

    getCurrentRoundInternal(client, function(err, current_round) {
      if(err) {
        next(err);
        done();
      }

      var insertVote = 'insert into vote(round_id, choice_id, user_id) values($1, $2, $3)\n '+
                       'on conflict on constraint vote_round_id_user_id_key do update set choice_id = $2';
      var values = [current_round.id, choice.id, user.id];
      console.log(values);
      client.query({text: insertVote, values: values}, function(err, result){
        next(err);
        done();
      });
    });
  });
}

module.exports = {
  getUser: getUser,
  saveToken: saveToken,
  getChoices: getChoices,
  makeVote: makeVote,
  getCurrentRound: getCurrentRound
};
