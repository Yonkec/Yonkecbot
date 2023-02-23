import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { chatGptClient } from '../bot.mjs';

const data = new SlashCommandBuilder()
    .setName('chatgpt')
    .setDescription('Hold a group chat with ChatGPT')
    .addStringOption(option =>
        option.setName('prompt')
            .setDescription('The prompt to generate a textual response')
            .setRequired(true));

async function execute (interaction) {
    

    await interaction.deferReply();

    const response = await fetch(
        `${apiHost}/v1beta/generation/${engineId}/text-to-image`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                text_prompts: [
                    {
                        text: interaction.options.getString('prompt'),
                    }
                ],
                cfg_scale: 20,
                height: 512,
                width: 512,
                sampler: 'DDIM',
                samples: 1,
                steps: 50,
            })
        }
    );
    
    if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
    }

    const responseJSON = await response.json();
    
    responseJSON.artifacts.forEach((image, index) => {
        const buffer = new Buffer.from(image.base64, "base64");
        const file = new AttachmentBuilder(buffer, { name: 'image.png' });

        const embed = new EmbedBuilder()
            .setTitle(interaction.options.getString('prompt'))
            .setImage('attachment://image.png')
            .setColor('#00ff00')
            .setFooter({ text: engineId });

            interaction.editReply({ embeds: [embed], files: [file] });
    });

export {
    data,
    execute
};