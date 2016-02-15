# lunchtime-slackbot

A slack bot to interface with the [lunchtime system](https://github.com/jamiepenney/lunchtime)
I built for my workmates to choose our Friday lunch destination.

## Requirements:
* Postgres 9.5 with the lunchtime database
* nodejs
* a config.js file (example provided in the repo)
* A Slack Bot token

## Configuration - config.js

Set the Slack Bot token `slackToken` in config.js.

Alternatively you can set everything from the environment variables:

* `SLACK_TOKEN` is the Slack Bot token we should use to post messages.
* `RAYGUN_API_KEY` is your Raygun API key if you want errors sent to Raygun.
* `DATABASE_URL`is your Postgres database connection string.

## Running
`node bin/www` will start the bot.
