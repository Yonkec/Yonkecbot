import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { openai } from '../bot.mjs';

const data = new SlashCommandBuilder()
    .setName('gpt-3')
    .setDescription('Accept a text input and returns a completion using text-davinci-003')
    .addStringOption(option =>
        option.setName('prompt')
            .setDescription('The prompt to generate a textual response')
            .setRequired(true));

async function execute (interaction) {
    
    await interaction.deferReply();
    
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: interaction.options.getString('prompt'),
            max_tokens: 500,
        });
        
        const embed = new EmbedBuilder()
            .setTitle(interaction.options.getString('prompt'))
            .setDescription(completion.data.choices[0].text)
            .setFooter({ text: "text-davinci=003" })
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