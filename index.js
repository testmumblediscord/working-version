var express = require('express');
var app = express();
var Discord = require('discord.io');
var events = require('events');
var eventEmitter = new events.EventEmitter();


////////////////////////////////////////////////////////////////
//// Express webpage for add bot to server button
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

///////////////////////////////////////////////////////////////
////Player

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

///////////////////////////////////////////////
//// commands

//a list of commands
var ServerCommands = [];

//the command constructor
//Name: the name of the command to run
//Description: detail of what the command does
var Command = function(name, description, method){
  this.Name = name;
  this.Description = description;
  this.userID = null;
  this.user = null;
  this.channelID = null;
  this.message = null;
};

Command.prototype.setMessage = function(message){
  this.message = message;
}

Command.prototype.setUser = function(user){
  this.user = user;
}

Command.prototype.setUserID = function(userID){
  this.userID = userID;
}

Command.prototype.setChannelID = function(channelID){
  this.channelID = channelID;
}

Command.prototype.getCommandName = function(){
  return this.Name;
};

Command.prototype.getDescription = function(){
  return this.Description;
};

//General commands
// Command = function(name, description, user, userID, method){
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

////////////////////////////////////////////////
/// class level variables


var m_commandList = "General: \n help, ping, setchannel, getchannel \n Gameplay: \n ";
//the letter or symbol for the bot to look for after a command.
var m_prefix = ";";
var m_currentChannel = null;


//////////////////////////////////////////////////
/// The message finder
///////////////////////////////////////////////////
bot.on('message', function(user, userID, channelID, message, event) {

  if(message.charAt(message.length-1) != ";")
  {
    return;
  }
  else
  {

    message = message.replace(m_prefix, "");
    // console.log(message.charAt(message.length-1));
    //go through all the commands and see what the user typed
    for (i = 0; i < ServerCommands.length; i++)
    {
        if(message == ServerCommands[i].getCommandName())
        {
          ServerCommands[i].setUser(user);
          ServerCommands[i].setUserID(userID);
          ServerCommands[i].setChannelID(channelID);
          ServerCommands[i].setMessage(message);
          eventEmitter.emit(ServerCommands[i].getCommandName(), ServerCommands[i]);
        }
    }

  }

});

///////////////// command methods

eventEmitter.on('help', function(command) {
    SendBotMessage(command.user, command.userID, command.channelID, "Commands: " + m_commandList);
});

eventEmitter.on('ping', function(command) {
  SendBotMessage(command.user, command.userID, command.channelID, "Pong");
});

eventEmitter.on('setchannel', function(command) {

  var newMessage = command.message;
  if(newMessage != "" || newMessage != " ")
  {
    m_currentChannel = command.channelID;
    SendBotMessage(command.user, command.userID, command.channelID, "New Channel is set");
  }

});

eventEmitter.on('getchannel', function(command) {
  SendBotMessage(command.user, command.userID, command.channelID, m_currentChannel);
});


//////////////////////////////
/// the bot messaging util

///sends a message to the given channel
function SendBotMessage(user, userID, channelID, newMessage)
{
    bot.sendMessage({
        to: channelID,
        message: newMessage
    });
}
