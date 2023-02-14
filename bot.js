//Eris is a node.js library used to create Discord bots
const Eris = require('eris');
//add the OpenAI API functionality
const { Configuration, OpenAIApi } = require('openai');
//initalize the accompanying database using sqlite3
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bot.db');
//used to create a quasi-table as Discord lacks such functionality
const { Table } = require ('embed-table');
//general Discord.JS Functionality
const { EmbedBuilder } = require ('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
//this is required to load variables from the .env file such as our API Keys
require('dotenv').config()
//Used to generate more-better random numbers (hopefully)
const crypto = require('crypto');


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

//Function to process a text completion via DaVinci
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

//Function to process an image completeion via DALL-E
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

//Generates a random value within a given range, inclusive
function leetRoll(min, max) {
    //old approach that sucked and was suspiciously violating statistical probabilities
    //return value = Math.floor(Math.random() * (upper - lower + 1)) + lower;

    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const randomBytes = crypto.randomBytes(bytesNeeded);
    const randomValue = randomBytes.readUIntBE(0, bytesNeeded);
    const result = min + (randomValue % range);
    return result;
}

//Sleeps the current execution for the indicated number of ms.
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Accepts a winner, loser, and processed DB queries to record the results / notify the channel of the outcome
function setWinnerLoser(winner, loser, msg){
    //first query checks to see if the user exists in the Db, if not we add them with 0 win/losses
    db.run('INSERT OR IGNORE INTO leetroll (id, wins, losses) VALUES (?, 0, 0)', winner.id);
    //update the winners W/L record
    db.run('UPDATE leetroll SET wins = wins + 1 WHERE id = ?', winner.id);

    //same deal here we check to see if the loser already exists in the DB, and if not we add them to it
    db.run('INSERT OR IGNORE INTO leetroll (id, wins, losses) VALUES (?, 0, 0)', loser.id);
    db.run('UPDATE leetroll SET losses = losses + 1 WHERE id = ?', loser.id);

    winnername = winner.nickname || winner.user.username;
    //the <@ functionality is used to create an @mention of the user, that is esssentially just <@DiscordUserID>
    bot.createMessage(msg.channel.id, "<@" + loser.id + "> rolled a zero, has been vanquished, and thus must now offer tribute to " + winnername + ".");
}
//Game that requires a lowerbound, upperbound, and user being challenged in format "$random lower upper @user"
//generates random dice rolls in the range alternating turns between the challenger, and the challenged.
//first to roll a 0 loses and the outcome is stored in the database 'leetroll'
async function autoLeet (msg) {

    //reset the current turn
    var onesTurn = true;

    //obtain the guildID necessary to perform user lookups on that chanel
    const guild = await client.guilds.fetch(msg.guildID).catch(() => null);

    //parse the triggering msg for lowerbound upperbound and user being @mentioned
    var args = msg.content.split(" ");
    var lowerBound = parseInt(args[1]);
    var upperBound = parseInt(args[2]);
    var upper = upperBound;
    var mentioned = args[3];

    //convert the challenger and challengee to a guildmember object
    const member1 = await guild.members.fetch(msg.author.id).catch(() => null);
    const member2 = await guild.members.fetch(mentioned.replace(/[<@!>]/g, "")).catch(() => null);

    //if  either lookup failed, return to avoid later errors
    if (!member1 || !member2) {
        bot.createMessage(msg.channel.id, "Please challenge a valid opponent.");
        return;
    }

    //try to assign a nickname, if one exists, if it does not then assign their username
    const player1 = member1.nickname || member1.user.username;
    const player2 = member2.nickname || member2.user.username;

    //if either player is a bot then abort as we don't have sufficient code to accomodate that scenario
    if (player1.bot || player2.bot){
        bot.createMessage(msg.channel.id, "Sorry - bots are statutorily restricted from participating in this activity.");
        return;
    }

    //create our roll message array, which will be expanded as we add new rolls
    //this avoid spamming the channel with individual bot messages we just use the same one and add new results
    const rollmsg = ["Initiating the Leet Roll....", "\n"];
    botmsg = await bot.createMessage(msg.channel.id, rollmsg.join(""));

    //loop to continue rolling until someone loses by rolling a 0
    do{
        var result = leetRoll(lowerBound,upper);

        //console.log("l:" + lower + " || u:" + upper + " || r:" + result);
        //splice adds additional strings to the rollmsg at the end of the array
        //then edits its current message with the new string by joining all pieces of the array
        rollmsg.splice(-1, 0, '\n', (onesTurn ? player1 : player2) + " rolled: " + result);
        await botmsg.edit(rollmsg.join(""));

        //condenses the range and then changes the turn to the next individual, then sleeps to add tension to game
        upper = result;
        onesTurn = !onesTurn;
        await sleep(upper > 5 ? 1500 : 3500);

    } while (result != lowerBound)

    //calls the DB update function in the correct order, depending on who's turn it is.  
    //If its my turn, it means you were the last to roll, and thus you must have lost
    if (onesTurn) {
        setWinnerLoser(member1, member2, msg);
    }else{
        setWinnerLoser(member2, member1, msg);
    }
}

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
        runCompletion(msg.content.substring(1)).then(result => bot.createMessage(msg.channel.id, result));
    } 

    else if(msg.content.startsWith("&")) {
        //same thing here we just receive an image URL instead of a text chat
        imageCompletion(msg.content.substring(1)).then(result => bot.createMessage(msg.channel.id, result));
    } 

    else if (msg.content.startsWith("$random")) {
        //calls our autoLeet function, only passing in the original message
        //everything else is done function-side
        autoLeet(msg);
    }
    
    else if (msg.content.startsWith("$top")) {
        
        const guild = await client.guilds.fetch(msg.guildID).catch(() => null);

        //queries the DB to pull all entries from leetroll, ordering them such that the leaderboard is ranked by wins
        db.all('SELECT * FROM leetroll ORDER BY wins DESC', async (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }

        //this relates to the embed-table api which creates a very crude table 
        //that can then be embedded into a message, as Discord contains absolutely no such functionality
        //on its own - sigh
        //titleIndexes and columnIndexes were hand calculated via trial and error to align the resulting table
        //if we add new columns we will then need to re-align everything
        
        //IF any value exceeds the size of the column in this fixed width notation it will crash the API
        //the Indexes are determining where each column begins and ends so the 1st column is 89? characters wide
        //the second one is 18? etc.  padEnd adds a few extra characters to the end to make it look better
        //the start and end character is a backtick used to improve visuals per Discords shitty formatting
        const table = new Table({
            titles: ['Name', 'Wins', 'Losses'],
            titleIndexes: [0, 90, 108],
            columnIndexes: [0, 42, 52],
            start: '`',
            end: '`',
            padEnd: 6
            });

            //loop over the list of dictionaries that was retured from the SQL query
        for (const row of rows) {

            //look back up the relevant username from our DB's userID
            const member = await guild.members.fetch(row['id']).catch(() => null);
            var user = null;
            var name = null;

            //added this because if any user in the leaderboard is not present in the current channel
            //we can't perform a guild(channel) lookup and instead must do a generic lookup
            //The reason we do a guild lookup is to allow for referencing their current Nickname
            //of the channel, otherwise we might be pulling their Username which is different
            if (member != null) {
                name = member.nickname || member.user.username;
            } else {
                user = await client.users.fetch(row['id']).catch(() => null);
                name = user.username;
            }            

            //add a new row to Table using the current row from our Db Query
            //Important to note this can only accept string values
            table.addRow([
                name, 
                row['wins'].toString(), 
                row['losses'].toString(),
            ]);
        }
        
        //build the embed and then insert it into a new bot message
        const embed = new EmbedBuilder().setFields(table.toField());
        bot.createMessage(msg.channel.id, {embed: embed});
        });
    }  
});

//tell the bot to connect itself to Discord
bot.connect();