import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Configuration, OpenAIApi } from 'openai';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('bot.db');
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

//===============================================================================
//Open Connections
//===============================================================================

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]   
});

client.login(process.env.DISCORD_BOT_TOKEN);
client.commands = new Collection();

//===============================================================================
//Validate Connections
//===============================================================================

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

//===============================================================================
// Discord Specific Initializations
//===============================================================================

const commandsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = await import(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

//===============================================================================
// Event Handling
//===============================================================================

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});


bot.on("messageCreate", async (msg) => {

    if(msg.content.startsWith("#")) {
        ai.runCompletion(msg.content.substring(1), openai).then(result => bot.createMessage(msg.channel.id, result));
    }
    else if(msg.content.startsWith("&d")) {
        ai.imageCompletion(msg.content.substring(3), openai).then(result => bot.createMessage(msg.channel.id, result));
    } 
    else if(msg.content.startsWith("&s")) {
        ai.stableDiffuse(msg, client, bot);
    }
    else if (msg.content.startsWith("$random")) {
        leet.autoLeet(msg, client, db, bot);
    }
    else if (msg.content.startsWith("$top")) {
        leet.leetTop(msg, client, db, bot);
    } 
});