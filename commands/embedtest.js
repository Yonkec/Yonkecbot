import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('Embed Test')
    .setDescription('Responds with sample embed.');
    
async function execute(interaction) {
    try {
        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('THIS IS MY TITLE IT IS A VERY GOOD TITLE, THE BEST INFACT.')
        .setURL('https://discord.js.org/')
        .setAuthor({ name: 'I AM THE AUTHOR OF THIS INFORMATIVE MESSAGE', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
        .setDescription('HELLO I AM THE DESCRIPTION OF THIS MESSAGE AND YOU CAN TRUST THAT IM OFFERING YOU ONLY THE MOST DESCRIPTIVE DESCRIPTIONS.')
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .addFields(
            { name: 'Regular field title', value: 'Some value here' },
            { name: '\u200B', value: '\u200B' },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
        .setImage('https://i.imgur.com/AfFp7pu.png')
        .setTimestamp()
        .setFooter({ text: 'THIS IS THE FOOTER BECAUSE EVERYONE HAS FEET IN THEIR HEART', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    bot.createMessage(msg.channel.id, {embed: embed});
    } catch (error){
        console.log(error);
    };
}

export {
    data,
    execute
};