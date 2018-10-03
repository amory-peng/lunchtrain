const Discord = require('discord.js');
const auth = require('./auth.json');
const LunchTrain = require('./lib/lunch_train').default;

const client = new Discord.Client();
const trains = {};

client.on('ready', () => {
  console.log(`Bot started at: ${new Date().toString()}`);
});

client.on('message', (message) => {
  if (message.content !== '!start') return;
  let train = trains[message.channel];
  if (!train || train.hasLeft()) {
    console.log(`train added for ${message.channel}`);
    train = new LunchTrain(message);
    trains[message.channel] = train;
    train.start();
  }
});

client.login(auth.token);
