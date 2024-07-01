import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const commands = [];
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

// Immediately Invoked Function Expression (IIFE) to use await
(async () => {
    for (const file of commandFiles) {
        const command = await import(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.DISCORD_BOT_CLIENT_ID, process.env.DISCORD_TEST_GUILD_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();