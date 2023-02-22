import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { openai } from '../bot.mjs';

const data = new SlashCommandBuilder()
    .setName('dalle')
    .setDescription('Responds with a Dall-E completion based on text input.')
    .addStringOption(option =>
        option.setName('prompt')
            .setDescription('The prompt to generate the image from')
            .setRequired(true)); 

async function execute (interaction) {

    await interaction.deferReply();

    try {
        const completion = await openai.createImage({
            prompt: interaction.options.getString('prompt'),
            n:1,
            size:'1024x1024',
        });

        const embed = new EmbedBuilder()
            .setTitle(interaction.options.getString('prompt') )
            .setImage(completion.data.data[0].url)
            .setFooter({ text: "Dall-E" })
            .setColor('#00ff00');

        interaction.editReply({ embeds: [embed] });
    }
    catch (error){
        console.log(error);
        return "Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowed by our safety system.";
    }
}
    

export {
    data,
    execute
};