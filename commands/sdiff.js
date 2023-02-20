import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responds with Pong!');
    
async function execute(interaction) {
        await interaction.reply('Pong');
}

export {
    data,
    execute
};