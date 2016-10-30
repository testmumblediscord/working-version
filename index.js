var express = require('express');
var app = express();
var Discord = require('discord.io');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var fs = require('fs');


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
  this.Level = 1;
  this.hp = 10;
  this.maxhp = this.Level * 10;
  this.Inventory = [];
  this.Weapon = "Fist";
  this.Gold = 2;
  this.Slain = 0;
  this.Killed = 0;
  // stats
  this.Points = 5;
  this.Strength = 1;
  this.Intelligence = 1;
  this.ArmorClass = 1;
  this.Charisma = 1;

};

Player.prototype.getName = function() {
  return this.firstName;
};

Player.prototype.getID = function() {
  return this.userID;
};

Player.prototype.getStats = function(player)
{
  var playerString = "```" +
  "!======== [" + player.getName() + " Stats] ========! \n" +
  "+ Health: " + player.hp + "|" + player.maxhp + "\n" +
  "+ for Inventory type inv; \n" +
  "+ Weapon: " + player.Weapon + " + \n" +
  "+ Level: " + player.Level + " + \n" +
  "+ Gold: " + player.Gold + " + \n" +
  "+ Slain: " + player.Slain + " + \n" +
  "+ Killed: " + player.Killed + " + \n" +
  "+ Strength: " + player.Strength + " + \n" +
  "+ Intelligence: " + player.Intelligence + " + \n" +
  "+ ArmorClass: " + player.ArmorClass + " + \n" +
  "+ Charisma: " + player.Charisma + " + \n" +
  "+ Points: " + player.Points + " + \n" +
  "!==================================! \n" + "```";
  return playerString;
}

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

///Player commands
var c_createplayer = new Command("createplayer", "Creates a player for the typed userID");
ServerCommands.push(c_createplayer);

var c_getplayerstats = new Command("getstats", "Gets the current stats of the typed userID");
ServerCommands.push(c_getplayerstats);

////////////////////////////////////////////////
/// class level variables


var m_commandList = "General: \n help, ping, setchannel, getchannel \n Gameplay: \n createplayer, getstats";
//the letter or symbol for the bot to look for after a command.
var m_prefix = ";";
var m_currentChannel = null;


//////////////////////////////////////////////////
/// The message finder
///////////////////////////////////////////////////
bot.on('message', function(user, userID, channelID, message, event) {

  //is the command using our prefix?
  if(message.charAt(message.length-1) != ";")
  {
    return;
  }
  else
  {
    //take out the prefix so we can match it with a server command
    message = message.replace(m_prefix, "");

    //only allow the user to type commands in the specific setChannel that is saved to m_currentChannel
    if(channelID != m_currentChannel)
    {
      //have basic commands here
      if(message == "help")
      {
        SendBotMessage(user, userID, channelID, "call setchannel; In the channel you wish Emerald Bot to listen for commands.");
      }
      else if(message == "setchannel")
      {
        m_currentChannel = channelID;
        SendBotMessage(user, userID, channelID, "channel is set to channelID: " + channelID);
      }
    }
    else
    {
      // console.log(message);
      //go through all the commands and see what the user typed
      for (i = 0; i < ServerCommands.length; i++)
      {
          if(message == ServerCommands[i].getCommandName())
          {
            ServerCommands[i].setUser(user);
            ServerCommands[i].setUserID(userID);
            ServerCommands[i].setChannelID(channelID);
            ServerCommands[i].setMessage(message);
            //call the the method we need and pass the server command object
            eventEmitter.emit(ServerCommands[i].getCommandName(), ServerCommands[i]);
            break;
          }
      }

    }

  }

});

///////////////// command methods

//help and server commands
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

eventEmitter.on('getstats', function(command) {

  for (i = 0; i < PlayerList.length; i++)
  {
    //we found a match so do not create a new player
    if(PlayerList[i].userID == command.userID)
    {
      var stats = PlayerList[i].getStats(PlayerList[i]);
      SendBotMessage(command.user, command.userID, command.channelID, stats);
    }

  }

});

///player commands
eventEmitter.on('createplayer', function(command) {

  console.log("creating a new player:" + PlayerList.length);

  if(PlayerList.length == 0)
  {
    //create a new player
    var newPlayer = new Player(command.user, command.userID);
    PlayerList.push(newPlayer);
    SendBotMessage(command.user, command.userID, command.channelID, "Creating a new player: " + command.user);
    SendBotMessage(command.user, command.userID, command.channelID, "Created A New Player: " + newPlayer.getStats(newPlayer));
  }
  else
  {
    //make sure there isn't a player already for the given user id
    for (i = 0; i < PlayerList.length; i++)
    {
      console.log("checking if player exists");
      //we found a match so do not create a new player
      if(PlayerList[i].userID == command.userID)
      {
          SendBotMessage(command.user, command.userID, command.channelID, "Already Have a Player. type getstats;");
      }
      else if(PlayerList.length == i && PlayerList[i].userID != command.userID)
      {
        //create a new player
        var newPlayer = new Player(command.user, command.userID);
        PlayerList.push(newPlayer);
        SendBotMessage(command.user, command.userID, command.channelID, "Creating a new player: " + command.user);
      }
      else {
        console.log("nothing matched: " + i + "| " + PlayerList.length);
      }
    }
  }

  console.log("creating a new player:" + PlayerList.length);


});


//////////////////////////////
/// the bot messaging util

///reads a given txt/json file and sends it to the channelID
///json reading tutorial https://www.codementor.io/nodejs/tutorial/how-to-use-json-files-in-node-js
function ReadFile(path)
{
  fs.readFile(path, 'utf8', function (err,data)
  {
    if (err)
    {
      return console.log(err);
    }
    else
    {
      return data;
      // SendBotMessage(user, userID, channelID, data);
    }
  });
}

///sends a message to the given channel
function SendBotMessage(user, userID, channelID, newMessage)
{
    bot.sendMessage({
        to: channelID,
        message: newMessage
    });
}
