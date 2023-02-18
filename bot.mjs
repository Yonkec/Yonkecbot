import * as leet from "./leetroll.js";
import * as ai from "./ai.js";

import Eris from 'eris';
import { Configuration, OpenAIApi } from 'openai';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('bot.db');

import { Client, GatewayIntentBits } from 'discord.js';

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

//initalize the OpenAI API using my API Key
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

//Discord.js requires that we declare our intents prior to obtaining API access.  These are necessary to obtain
//various user/guild information and create bot messages in a channel.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]   
});

//Connect to both Eris and Discord.js using the tokens saved in our .env file
const openai = new OpenAIApi(configuration);
//Discord Bot Token is obtained after creating/registering my bot with Discord
const bot = new Eris(process.env.DISCORD_BOT_TOKEN);
client.login(process.env.DISCORD_BOT_TOKEN);


//Indicates when Eris is ready to accept input
bot.on("ready", () => { 
    console.log("Eris is connected and ready!"); 
});

//Indicates when Discord.Js is ready to accept input
client.on("ready", () => { 
    console.log("Discord.js is connected and ready!"); 
});

//Alerts if Eris failed to initialize / encountered an error
bot.on("error", (err) => {
  console.error(err); 
});

//Alerts if Discord.js failed to initalize or encountered an error
client.on("error", (err) => {
    console.error(err); 
  });

//messageCreate is called when a user creates a message in one of the bots active channels
//this message is then parsed to check to see if it contains any of the indicated commands
//if so we execute the related code
bot.on("messageCreate", async (msg) => {

    if(msg.content.startsWith("#")) {
        //this calls our function, passing it the message entered by the user
        //the .substring(1) call strips the first character from the string, returning everything else
        //.then() is used to handle the promise of the async runCompletion function
        //we then pass that eventual result over into the bot.createMessage function
        //that function identifies the current channel by checking to see which channel the trigger message arose from
        //and passes the "prmosied" result into a new Bot Message we see in discord
        ai.runCompletion(msg.content.substring(1), openai).then(result => bot.createMessage(msg.channel.id, result));
    } 

    else if(msg.content.startsWith("&")) {
        //same thing here we just receive an image URL instead of a text chat
        ai.imageCompletion(msg.content.substring(1), openai).then(result => bot.createMessage(msg.channel.id, result));
    } 

    else if (msg.content.startsWith("$random")) {
        //calls our autoLeet function, only passing in the original message
        //everything else is done function-side
        leet.autoLeet(msg, client, db, bot);
    }
    
    else if (msg.content.startsWith("$top")) {
        leet.leetTop(msg, client, db, bot);
    }  
});

//tell the bot to connect itself to Discord
bot.connect();