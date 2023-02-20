import * as leet from "./leetroll.js";
import * as ai from "./ai.js";

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Eris from 'eris';
const bot = new Eris(process.env.DISCORD_BOT_TOKEN);

import { Configuration, OpenAIApi } from 'openai';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('bot.db');
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

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

bot.on("ready", () => { 
    console.log("Eris is connected and ready!"); 
});
bot.on("error", (err) => {
  console.error(err); 
});
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
    else if (msg.content.startsWith("!embed")) {

        try {
            const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('THIS IS MY TITLE IT IS A VERY GOOD TITLE, THE BEST INFACT.')
            .setURL('https://discord.js.org/')
            .setAuthor({ name: 'I AM THE AUTHOR OF THIS INFORMATIVE MESSAGE', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
            .setDescription('HELLO I AM THE DESCRIPTION OF THIS MESSAGE AND YOU CAN TRUST THAT IM OFFERING YOU ONLY THE MOST DESCRIPTIVE DESCRIPTIONS.')
            .setThumbnail('https://i.imgur.com/AfFp7pu.png')
            .addFields(
                { name: 'Regular field title', value: 'Some value here' },
                { name: '\u200B', value: '\u200B' },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
            .setImage('https://i.imgur.com/AfFp7pu.png')
            .setTimestamp()
            .setFooter({ text: 'THIS IS THE FOOTER BECAUSE EVERYONE HAS FEET IN THEIR HEART', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

        bot.createMessage(msg.channel.id, {embed: embed});
        } catch (error){
            console.log(error);
        };

    }  
    else if (msg.content.startsWith("!embed2")) {

        try {
            const exampleEmbed = {
                color: 0x0099ff,
                title: 'Some title',
                url: 'https://discord.js.org',
                author: {
                    name: 'Some name',
                    icon_url: 'https://i.imgur.com/AfFp7pu.png',
                    url: 'https://discord.js.org',
                },
                description: 'Some description here',
                thumbnail: {
                    url: 'https://i.imgur.com/AfFp7pu.png',
                },
                fields: [
                    {
                        name: 'Regular field title',
                        value: 'Some value here',
                    },
                    {
                        name: '\u200b',
                        value: '\u200b',
                        inline: false,
                    },
                    {
                        name: 'Inline field title',
                        value: 'Some value here',
                        inline: true,
                    },
                    {
                        name: 'Inline field title',
                        value: 'Some value here',
                        inline: true,
                    },
                    {
                        name: 'Inline field title',
                        value: 'Some value here',
                        inline: true,
                    },
                ],
                image: {
                    url: 'https://i.imgur.com/AfFp7pu.png',
                },
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Some footer text here',
                    icon_url: 'https://i.imgur.com/AfFp7pu.png',
                },
            };

            bot.createMessage(msg.channel.id, {embed: embed});
        } catch (error){
            console.log(error);
        };

    }  
});

bot.connect();