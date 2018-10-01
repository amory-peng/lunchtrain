const Discord = require('discord.js');
const auth = require('./auth.json');
const LunchTrain = require('./lib/lunch_train').default;

const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', (message) => {
  if (message.content === '!start') {
    const train = new LunchTrain(message);
    train.start();
  }
});

client.login(auth.token);
