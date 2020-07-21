const fs = require('fs');
const Discord = require('discord.js');
const Config = require('./config.json');
const GameData = require('./data.json');
const client = new Discord.Client();

var current = {};

client.once('ready', () => {
    console.log('Ready!');
    console.log(`Logged in as ${client.user.tag}!`);
});

client.once('reconnecting', () => {
    console.log('Reconnecting!');
});

client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('message', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(Config.prefix)) return;

    const args = message.content.slice(Config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase(); 
        
    try {
      if (command === 'play')
      {
        if (args.length === 0) {
          return message.channel.send('must supply game type.')
        }
        
        const option = args.shift().toLowerCase();
       
        if (option === 'beforeandafter') {
          if (Object.keys(current).length === 0) {
           current = GameData.beforeandafters[Math.floor(Math.random() * GameData.beforeandafters.length)];
           message.channel.send('Starting Round.');
          } else {
            message.channel.send('Game in progress.');
          }
         
          message.channel.send(current.plot);
          message.channel.send('Use !guess <answer> to make a guess.');
        } else {
          throw new Error('Unsupported Option.');
        }
      }
      
      if (command === 'guess') {
        if (Object.keys(current).length === 0) {
          return message.channel.send('No Game in Progress');
        }
          
        if (args.length === 0) return;
       
        var correct = false;
       
        if (args.join(' ').toLowerCase() === current.answer.toLowerCase()) {
          correct = true;
        }
        
        if (correct === true) {
          message.channel.send(`Congrats ${message.author}!`);
          message.channel.send(`Game was used on episode: ${current.episode}`);
          message.channel.send('Round Over.');
          current = {};
        } else {
          message.channel.send(`Sorry ${message.author} that is not correct. Try again.`);
        }
       
        return;
      }
    } catch (error) {
        console.error(error);
        message.channel.send('There was an error trying to execute that command!');
    }
});

client.login(Config.token);