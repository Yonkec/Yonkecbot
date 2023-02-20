import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('GPT Completion')
    .setDescription('Accept a text input and returns a completion using text-davinci-003');
    
async function runCompletion (msg, openai) {
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

export {
    data,
    runCompletion
};