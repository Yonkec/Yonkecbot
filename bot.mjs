import * as leet from "./leetroll.js";
import * as ai from "./ai.js";

import Eris from 'eris';
import { Configuration, OpenAIApi } from 'openai';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('bot.db');
import { Client, GatewayIntentBits } from 'discord.js';
import { EmbedBuilder } from 'discord.js';


import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


//Discord.js requires that we declare our intents prior to obtaining API access.  These are necessary to obtain
//various user/guild information and create bot messages in a channel.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]   
});

client.login(process.env.DISCORD_BOT_TOKEN);
const bot = new Eris(process.env.DISCORD_BOT_TOKEN);





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