import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Table } from 'embed-table';
import { db, client } from '../bot.mjs';


const data = new SlashCommandBuilder()
    .setName('rolltop')
    .setDescription('Responds with the top LeetRolling users on the server.');
    
async function execute(interaction) {

        interaction.deferReply();
        const msg = await interaction.fetchReply();
        const guild = await client.guilds.fetch(msg.guildId).catch(() => null);
    
        db.all('SELECT * FROM leetroll ORDER BY wins DESC', async (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }
    
        const table = new Table({
            titles: ['Name', 'Wins', 'Losses'],
            titleIndexes: [0, 90, 108],
            columnIndexes: [0, 42, 52],
            start: '`',
            end: '`',
            padEnd: 6
            });
    
        for (const row of rows) {

            const member = await guild.members.fetch(row['id']).catch(() => null);
            var user = null;
            var name = null;
    
            if (member != null) {
                name = member.nickname || member.user.username;
            } else {
                user = await client.users.fetch(row['id']).catch(() => null);
                name = user.username;
            }            

            table.addRow([
                name, 
                row['wins'].toString(), 
                row['losses'].toString(),
            ]);
        }

        const embed = new EmbedBuilder().setFields(table.toField());
        interaction.editReply({ embeds: [embed] });
        });
    }

export {
    data,
    execute
};