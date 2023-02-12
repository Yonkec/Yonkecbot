const Eris = require('eris');
const { Configuration, OpenAIApi } = require('openai');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bot.db');
const { Table } = require ('embed-table');
const { EmbedBuilder } = require ('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]   
});

const openai = new OpenAIApi(configuration);
const bot = new Eris(process.env.DISCORD_BOT_TOKEN);

client.login(process.env.DISCORD_BOT_TOKEN);

var gameInProgress = false;
var player1 = false;
var player2 = false;
var onesTurn = true;
var currentRoll = 1337;

async function runCompletion (message) {
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: message,
            max_tokens: 500,
        });

        return completion.data.choices[0].text;
    }
    catch (error){
        return "Stop being a dick, you know I won't respond to that.";
    }
}

async function imageCompletion (message) {
    try {
        const completion = await openai.createImage({
            prompt: message,
            n:1,
            size:'1024x1024',
        });

        return completion.data.data[0].url;
    }
    catch (error){
        return "Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowed by our safety system.";
    }
}

// function randomLeet (msg) {

//     if ((msg.author.id === player1 && !onesTurn) || (msg.author.id === player2 && onesTurn)) {
//         bot.createMessage(msg.channel.id, msg.author.id + " please wait your turn.");
//         return;
//     }

//     var args = msg.content.split(" ");
//     var lowerBound = parseInt(args[1]);
//     var upperBound = parseInt(args[2]);

//     if (upperBound != currentRoll) {
//         bot.createMessage(msg.channel.id, msg.author.id + " please roll a 0 through " + currentRoll + ".");
//         return;
//     }

//     var result = Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;

//     if (result != 0) {

//         bot.createMessage(msg.channel.id, "<@" + msg.author.id + "> rolled: " + result);

//     } else {

//         gameInProgress = false;
//         bot.createMessage(msg.channel.id, "<@" + msg.author.id + "> rolled a zero, has been vanquished, and thus must now offer tribute to their opponent.")
//         db.run('INSERT OR IGNORE INTO leetrolls (username, wins) VALUES (?, 0)', msg.author.username);
//         db.run('UPDATE leetrolls SET losses = losses + 1 WHERE username = ?', msg.author.username);
    
//     }

//     onesTurn = !onesTurn;
// }

function leetRoll(lower, upper) {
    return value = Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setWinnerLoser(winner, loser, msg){
    db.run('INSERT OR IGNORE INTO leetroll (id, wins, losses) VALUES (?, 0, 0)', winner.id);
    db.run('UPDATE leetroll SET wins = wins + 1 WHERE id = ?', winner.id);

    db.run('INSERT OR IGNORE INTO leetroll (id, wins, losses) VALUES (?, 0, 0)', loser.id);
    db.run('UPDATE leetroll SET losses = losses + 1 WHERE id = ?', loser.id);
    
    bot.createMessage(msg.channel.id, "<@" + loser.id + "> rolled a zero, has been vanquished, and thus must now offer tribute to " + winner.username + ".");
}

async function autoLeet (msg) {

    var args = msg.content.split(" ");
    var lowerBound = parseInt(args[1]);
    var upperBound = parseInt(args[2]);
    var upper = upperBound;
    var mentioned = args[3];

    const player1 = bot.users.get(msg.author.id);
    const player2 = bot.users.get(mentioned.replace(/[<@!>]/g, ""));

    if (!player1 || !player2 || player1.bot || player2.bot){
        bot.createMessage(msg.channel.id, "Sorry - bots are statutorily restricted from participating in this activity.");
        return;
    }

    do{
        var result = leetRoll(lowerBound,upper);
        //console.log("l:" + lower + " || u:" + upper + " || r:" + result);
        bot.createMessage(msg.channel.id, "<@" + (onesTurn ? player1.id : player2.id) + "> rolled: " + result);
        upper = result;
        onesTurn = !onesTurn;
        await sleep(1000);
    } while (result != lowerBound)

    if (onesTurn) {
        setWinnerLoser(player1, player2, msg);
    }else{
        setWinnerLoser(player2, player1, msg);
    }
}

async function getUser(id) {
    return await client.users.fetch(id);
}

bot.on("ready", () => { 
    console.log("Eris is connected and ready!"); 
});

client.on("ready", () => { 
    console.log("Discord.js is connected and ready!"); 
});

bot.on("error", (err) => {
  console.error(err); 
});

client.on("error", (err) => {
    console.error(err); 
  });

bot.on("messageCreate", async (msg) => {
    if(msg.content.startsWith("#")) {
        runCompletion(msg.content.substring(1)).then(result => bot.createMessage(msg.channel.id, result));
    } 
    else if(msg.content.startsWith("&")) {
        imageCompletion(msg.content.substring(1)).then(result => bot.createMessage(msg.channel.id, result));
    } 
    else if (msg.content.startsWith("$random")) {
        autoLeet(msg);
    }
    else if (msg.content.startsWith("$top")) {
        
        const guild = await client.guilds.fetch(msg.guildID).catch(() => null);

        db.all('SELECT * FROM leetroll ORDER BY wins DESC', async (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }

        const table = new Table({
            titles: ['Name', 'Wins', 'Losses'],
            titleIndexes: [0, 90, 108],
            columnIndexes: [0, 42, 52],
            start: '`',
            end: '`',
            padEnd: 6
            });

        for (const row of rows) {

            const member = await guild.members.fetch(row['id']).catch(() => null);
            const name = member.nickname || member.user.username;

            table.addRow([
                name, 
                row['wins'].toString(), 
                row['losses'].toString(),
            ]);
        }

        const embed = new EmbedBuilder().setFields(table.toField());
        bot.createMessage(msg.channel.id, {embed: embed});
        });
    }  
    // else if (msg.content.startsWith("$lr")) {
    //     if (gameInProgress === false){

    //         gameInProgress = true;

    //         var args = msg.content.split(" ");
    //         var mentioned = args[1];
    
    //         player1 = msg.author.id;
    //         player2 = bot.users.get(mentioned.replace(/[<@!>]/g, ""));
    
    //         bot.createMessage(msg.channel.id, player1 + " has challenged " + player2 + " to a Leet Roll!");
    //     } else {
    //         bot.createMessage(msg.channel.id, "Sorry " + msg.author.username + ", there is already a challenge in progress.");
    //     }
    // }
});

bot.connect();