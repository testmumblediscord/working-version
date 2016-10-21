var express = require('express');
var app = express();
var Discord = require('discord.io');

////////////////////////////////////////////////////////////////
//// Express stuff
////////////////////////////////////////////////////////////////

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

////////////////////////////////////////////////////////////////
//// Discord
////////////////////////////////////////////////////////////////

var bot = new Discord.Client({
    token: "MjM4Nzg1ODAwNzY0OTE1NzEy.CurVwQ.3035GY3YxLw3VBKaDcpugL2V7v0",
    autorun: true
});

bot.on('ready', function() {
    console.log(bot.username + " - (" + bot.id + ")");
});

//a list of the current players
var PlayerList = [];

//// Player Class
// firstName: user name on the discord channel
// id: the userID on the channel
var Player = function(firstName, id) {
  this.firstName = firstName;
  this.userID = id;
};

Player.prototype.getName = function() {
  return this.firstName;
};

Player.prototype.getID = function() {
  return this.userID;
};

//a list of commands
var ServerCommands = [];

//the command constructor
//Name: the name of the command to run
//Description: detail of what the command does
var Command = function(name, description){
  this.Name = name;
  this.Description = description;
};

Command.prototype.getCommandName = function(){
  return this.Name;
};

Command.prototype.getDescription = function(){
  return this.Description;
};

//General commands
//help command
var c_general = new Command("help", "List of server commands");
ServerCommands.push(c_general);
//ping command
var c_ping = new Command("ping", "Replies with Pong");
ServerCommands.push(c_ping);
//setchannel command
var c_setchannel = new Command("setchannel", "Must be called in the channel you wish to set. Makes the bot listen to a specific channel.");
ServerCommands.push(c_setchannel);
//getchannel command
var c_getchannel = new Command("getchannel", "tells you which channel ID the bot is subscribed to");
ServerCommands.push(c_getchannel);



// var person1 = new Person("Alice");
// var person2 = new Person("Bob");
//
// // call the Person sayHello method.
// person1.sayHello(); // logs "Hello, I'm Alice"
// person2.sayHello(); // logs "Hello, I'm Bob"

////////////////////////////////////////////////

var m_commandList = "General: \n help, ping, setchannel, getchannel \n Gameplay: \n ";
var m_prefix = "";
var m_currentChannel = null;


//////////////////////////////////////////////////
/// The message finder
///////////////////////////////////////////////////
bot.on('message', function(user, userID, channelID, message, event) {

  //iterate through the command list and see if a user typed a command
  for (i = 0; i < ServerCommands.length; i++)
  {
    if(message == ServerCommands[i].getCommandName())
    {
      bot.sendMessage({
        to: channelID,
        message: ServerCommands[i].getCommandName()
      });
    }
  }
    //
    // if(channelID == m_currentChannel)
    // {
    //   //start the giant if statement of messages
    //   if (message === "ping")
    //   {
    //     bot.sendMessage({
    //         to: channelID,
    //         message: "pong " + user
    //     });
    //   }
    //   else if(message == "setchannel")
    //   {
    //     var newMessage = message;
    //     if(newMessage != "" || newMessage != " ")
    //     {
    //       m_currentChannel = channelID;
    //       console.log(m_currentChannel);
    //       bot.sendMessage({
    //           to: channelID,
    //           message: "New Channel is set"
    //       });
    //     }
    //     else
    //     {
    //       bot.sendMessage({
    //           to: channelID,
    //           message: "Error is not correct."
    //       });
    //     }
    //   }
    //   else if(message == "getchannel")
    //   {
    //     bot.sendMessage({
    //         to: channelID,
    //         message: "Current channel: " + m_currentChannel
    //     });
    //   }
    //   else if(message == "help")
    //   {
    //     bot.sendMessage({
    //         to: channelID,
    //         message: "Commands: " + m_commandList
    //     });
    //   }
    // }
    // else
    // {
    //
    //   //there is no channel set. So give users a couple of commands
    //   if(message == "setchannel")
    //   {
    //     var newMessage = message;
    //     if(newMessage != "" || newMessage != " ")
    //     {
    //       m_currentChannel = channelID;
    //       console.log(m_currentChannel);
    //       bot.sendMessage({
    //           to: channelID,
    //           message: "New Channel is set"
    //       });
    //     }
    //     else
    //     {
    //       bot.sendMessage({
    //           to: channelID,
    //           message: "Error is not correct."
    //       });
    //     }
    //   }
    //   else if(message == "help")
    //   {
    //     bot.sendMessage({
    //         to: channelID,
    //         message: "Channel Not Set. Call setchannel in the channel you want me to listen to."
    //     });
    //   }
    // }
});
