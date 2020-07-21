const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), readGameData);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * https://docs.google.com/spreadsheets/d/1q0klR8FeR-ea5fsyL9YwVQqQyI6nmcYKOW9R_UktUsQ/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
 
 var GameData = 
   {
     "beforeandafters": []
   };
 
function readGameData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1q0klR8FeR-ea5fsyL9YwVQqQyI6nmcYKOW9R_UktUsQ',
    range: 'USED!B4:E331',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        //console.log(`${row[1]}, ${row[0]}, ${row[3]}`);
        
        GameData.beforeandafters.push({
          "plot": row[1],
          "answer": row[0],
          "episode": row[3]
        })
      });
    } else {
      console.log('No data found.');
    }   
  });
}

const Discord = require('discord.js');
const Config = require('./config.json');
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
           console.log(current);
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