import fetch from 'node-fetch';
import * as Discord from 'discord.js';

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const engineId = 'stable-diffusion-512-v2-1';
const apiHost = process.env.API_HOST ?? 'https://api.stability.ai'
const apiKey = process.env.STABILITY_API_KEY

export async function runCompletion (msg, openai) {
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: msg,
            max_tokens: 500,
        });

        return completion.data.choices[0].text;
    }
    catch (error){
        console.log(error)
        return "Stop being a dick, you know I won't respond to that.";
    }
}

export async function imageCompletion (msg, openai) {
    try {
        const completion = await openai.createImage({
            prompt: msg,
            n:1,
            size:'1024x1024',
        });

        return completion.data.data[0].url;
    }
    catch (error){
        console.log(error);
        return "Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowed by our safety system.";
    }
}

export async function stableDiffuse(msg, client) {

    const channel = await client.channels.fetch(msg.channel.id);

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
                        text: msg.content.substring(3)
                    }
                ],
                cfg_scale: 20,
                height: 512,
                width: 512,
                sampler: 'DDIM',
                samples: 1,
                steps: 70,
            })
        }
    );
    
    if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
    }

    const responseJSON = await response.json();
    
    responseJSON.artifacts.forEach((image, index) => {
        const buffer = new Buffer.from(image.base64, "base64");
        const file = new Discord.AttachmentBuilder(buffer, { name: 'image.png' });

        const embed = new Discord.EmbedBuilder()
            .setTitle("Its Reading Rainbow!")
            .setDescription(msg.content.substring(3))
            .setImage('attachment://image.png')
            .setColor('#00ff00');

            channel.send({ embeds: [embed], files: [file] });
    });
}