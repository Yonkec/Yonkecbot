import { SlashCommandBuilder } from 'discord.js';
import * as utils from "../utils.js"
import { db, client } from '../bot.mjs';

const data = new SlashCommandBuilder()
    .setName('leetroll')
    .setDescription('Input your minimum and maximum values, and challenge your breh to a game of leetroll!')
    .addIntegerOption(option =>
        option.setName('minroll')
            .setDescription('The minimum (losing) roll value for the leet roll')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('maxroll')
            .setDescription('The starting maximum value for the leet roll')
            .setRequired(true))
    .addUserOption(option =>
        option.setName('victim')
            .setDescription('The user you wish to challenge to a game of leetroll.')
            .setRequired(true));

function setWinnerLoser(winner, loser, interaction){

    db.run('INSERT OR IGNORE INTO leetroll (id, wins, losses) VALUES (?, 0, 0)', winner.id);
    db.run('UPDATE leetroll SET wins = wins + 1 WHERE id = ?', winner.id);

    db.run('INSERT OR IGNORE INTO leetroll (id, wins, losses) VALUES (?, 0, 0)', loser.id);
    db.run('UPDATE leetroll SET losses = losses + 1 WHERE id = ?', loser.id);
    
    interaction.followUp("<@" + loser.id + "> rolled a zero, has been vanquished, and thus must now offer tribute to " + winner.displayName + ".");
}

async function execute (interaction) {
    
    interaction.deferReply();

    var onesTurn = true;
    const msg = await interaction.fetchReply();
    const guild = await client.guilds.fetch(msg.guildId).catch(() => null);

    var lowerBound = interaction.options.getInteger('minroll');
    var upperBound = interaction.options.getInteger('maxroll');
    var upper = upperBound;

    const member1 = await guild.members.fetch(interaction.user).catch(() => null);
    const member2 = await guild.members.fetch(interaction.options.getUser('victim')).catch(() => null);

    const player1 = member1.displayName
    const player2 = member2.displayName

    const rollmsg = ["Initiating the Leet Roll....", "\n"];
    var botmsg = await interaction.editReply(rollmsg.join(""));

    do{
        var result = utils.leetRoll(lowerBound,upper);

        rollmsg.splice(-1, 0, '\n', (onesTurn ? player1 : player2) + " rolled: " + result);
        await botmsg.edit(rollmsg.join(""));

        upper = result;
        onesTurn = !onesTurn;
        await utils.sleep(upper > 5 ? 1500 : 3500);

    } while (result != lowerBound)

    if (onesTurn) {
        setWinnerLoser(member1, member2, interaction);
    }else{
        setWinnerLoser(member2, member1, interaction);
    }
}


export {
    data,
    execute
};