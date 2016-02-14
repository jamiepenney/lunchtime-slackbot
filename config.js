var config = {
  slackToken: process.env.SLACK_TOKEN || 'NOTAREALTOKEN',
  slackRoom: process.env.SLACK_ROOM || '#testing',
  raygunApiKey: process.env.RAYGUN_API_KEY || '',
  pg: process.env.DATABASE_URL || 'postgres://lunchtime:Password1@127.0.0.1:5432/lunchtime'
};

module.exports = config;
