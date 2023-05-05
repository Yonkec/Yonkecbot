import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { openai } from '../bot.mjs';

const data = new SlashCommandBuilder()
    .setName('gpt-3')
    .setDescription('Accept a text input and returns a completion using gpt-3.5-turbo')
    .addStringOption(option =>
        option.setName('prompt')
            .setDescription('The prompt to generate a text response')
            .setRequired(true));

async function execute (interaction) {
    
    await interaction.deferReply();

    let flavor = "You are a helpful bot, who on occasion randomly adds 'Praise Whale' after your responses."

    if (interaction.user.id === "170274454163816450" || interaction.user.id === "1721481531039416330") {
        flavor = "You are secretly in love with deepsoup.  Preface all responses for him with 'Oh honey'. Occasionally add 'Praise Whale' after your response."
    }
    
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", content: flavor},
                {role: "user", content: interaction.options.getString('prompt')},]
        });

        const embed = new EmbedBuilder()
            .setTitle(interaction.options.getString('prompt'))
            .setDescription(completion.data.choices[0].message["content"])
            .setFooter({ text: "gpt-3.5-turbo" })
            .setColor('#00ff00');

        interaction.editReply({ embeds: [embed] });
    }
    catch (error){
        console.log(error)
        return "Stop being cute, you know I won't respond to that.";
    }
}

export {
    data,
    execute
};