var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var misc = require('./misc.json');
var rec = require('./request.json');
var cmdPrompt = "!tk";
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
	
	bot.setPresence({game:{name:"Type !tk help"}});
});
bot.on('message', function (user, userID, channelID, message, evt) {
	message = messageCleaner(message);
	
	//Iterate through JSON objects and send response, if applicable
	if (userID != auth.userID) {
		if (message.substring(0,cmdPrompt.length) == cmdPrompt)
			botCommand(channelID, message);
		else
			botResponse(channelID, message);
	}
});

function messageCleaner(message) {
	return message.toLowerCase();
}

function sendMessage(channelID, message) {
	bot.sendMessage({
		to: channelID,
		message: message
	});
}

function msgValidation(sub, message) {
	var index = 0;
	while (message.indexOf(sub,index) != -1) {
		index = message.indexOf(sub,index);
		//Only accept keywords not surrounded by letters
		if (!message.charAt(index-1).match(/[a-z]/i) &&
		    !message.charAt(index+sub.length).match(/[a-z]/i))
			return true;
		index++;
	}
	return false;
}

function botResponse(channelID, message) {
	for (var prime in misc) {
		for (var sub in misc[prime]) {
			if (message.includes(sub)) {
				if (msgValidation(sub, message))
					sendMessage(channelID, misc[prime][sub]);
			}
		}
	}
}

function cmdParse(message) {
	//remove !tk request trigger and additional space
	message = message.substring(cmdPrompt.length+1);
	
	if (message.indexOf(" ") == -1)
		return {"cmd":message};
		
	return {
		"cmd":message.substring(0,message.indexOf(" ")),
		"q1":message.substring(message.indexOf(" ")+1)
	};
}

function random(max) {
	return (Math.random() * (max + 1)) << 0;
}

function botCommand(channelID, message) {
	try {
		var qualifiers = cmdParse(message);
		var total = 0;
		
		switch(qualifiers.cmd) {
			case "help":
				for (var key in rec[qualifiers.cmd]) {
					sendMessage(channelID, rec[qualifiers.cmd][key]["description"] + "\n\n"
										 + rec[qualifiers.cmd][key]["qualifiers"] + "\n"
										 + rec[qualifiers.cmd][key]["example"]);
				}
				break;
			case "rec":
				for (var key in rec[qualifiers.cmd][qualifiers.q1]) {
					total++;
				}
				sendMessage(channelID, rec[qualifiers.cmd][qualifiers.q1][random(total-1)]);
				break;
			default:
				sendMessage(channelID, "Invalid command. Please type \"!tk help\" for valid command list.");
		}
	} catch (error) {
		sendMessage(channelID, "Invalid command. Please type \"!tk help\" for valid command list.");
	}
}