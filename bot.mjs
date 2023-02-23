import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Configuration, OpenAIApi } from 'openai';
import sqlite3 from 'sqlite3';
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

//===============================================================================
//Open Connections / Make them available to other modules
//===============================================================================

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);
export const db = new sqlite3.Database('bot.db');

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        //GatewayIntentBits.MessageContent,
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

commandFiles.forEach(async file => {
	const filePath = path.join(commandsPath, file);
	const command = await import(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
});

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
        await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});