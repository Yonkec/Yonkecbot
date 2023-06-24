import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} from 'discord.js';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const engineId = 'stable-diffusion-512-v2-1';
const apiHost = process.env.API_HOST ?? 'https://api.stability.ai'
const apiKey = process.env.STABILITY_API_KEY

const data = new SlashCommandBuilder()
    .setName('sdiff')
    .setDescription('Responds with a StableDiffusion Completion from text input.')
    .addStringOption(option =>
        option.setName('prompt')
            .setDescription('The prompt used to generate the new image')
            .setRequired(true));
    
async function execute(interaction) {

    await interaction.deferReply();

    const response = await fetch(

        `${apiHost}/v1/generation/${engineId}/text-to-image`,
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
            },
            ],
            cfg_scale: 7,
            clip_guidance_preset: 'FAST_BLUE',
            height: 512,
            width: 512,
            samples: 1,
            steps: 30,
        }),
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
}

//Following is used only to query available stability.ai engines for use above

// const url = `${apiHost}/v1/engines/list`;

// if (!apiKey) throw new Error('Missing Stability API key.');

// const response = await fetch(url, {
//   method: 'GET',
//   headers: {
//     Authorization: `Bearer ${apiKey}`,
//   },
// });

// if (!response.ok) {
//   throw new Error(`Non-200 response: ${await response.text()}`);
// }

// const payload = await response.json();
// console.log(payload);

export {
    data,
    execute
};