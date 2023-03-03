import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('embedtest')
    .setDescription('Responds with test embed.');
    
async function execute(interaction) {

    await interaction.deferReply({ ephemeral: true });

    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('primary')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Primary),
    )
    .addComponents(
        new ButtonBuilder()
            .setCustomId('secondary')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Secondary),
    )
    .addComponents(
        new ButtonBuilder()
            .setCustomId('success')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Success),
    )
    .addComponents(
        new ButtonBuilder()
            .setCustomId('danger')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Danger),
    )
    .addComponents(
        new ButtonBuilder()
            .setLabel('Im a link!')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.js.org'),
    );

    const row2 = new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions(
                {
                    label: 'Select me',
                    description: 'This is a description',
                    value: 'first_option',
                },
                {
                    label: 'You can select me too',
                    description: 'This is also a description',
                    value: 'second_option',
                },
            ),
    );

    const row3 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('primary2')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Primary),
    )
    .addComponents(
        new ButtonBuilder()
            .setCustomId('secondary2')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Secondary),
    )
    .addComponents(
        new ButtonBuilder()
            .setCustomId('success2')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Success),
    )
    .addComponents(
        new ButtonBuilder()
            .setCustomId('danger2')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Danger),
    )
    .addComponents(
        new ButtonBuilder()
            .setLabel('Im a link!')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.js.org'),
    );

    const row4 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('primary3')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Primary),
    )
    .addComponents(
        new ButtonBuilder()
            .setCustomId('secondary3')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Secondary),
    )
    .addComponents(
        new ButtonBuilder()
            .setCustomId('success3')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Success),
    )
    .addComponents(
        new ButtonBuilder()
            .setCustomId('danger3')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Danger),
    )
    .addComponents(
        new ButtonBuilder()
            .setLabel('Im a link!')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.js.org'),
    );

    const row5 = new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('select2')
            .setPlaceholder('Nothing selected')
            .addOptions(
                {
                    label: 'Select me2',
                    description: 'This is a description',
                    value: 'first_option2',
                },
                {
                    label: 'You can select me too2',
                    description: 'This is also a description',
                    value: 'second_option2',
                },
            ),
    );


    try {
        const scene = new EmbedBuilder()
        .setColor(0x00ff9d)
        .setTitle('NAME OF THE SCENE')
        .setDescription('You step into the alley, confronted by what appears to be a very large mushroom.')


        const mob = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('An Angry Italian Mushroom')
        .addFields(
            { name: 'Current HP', value: '100/120', inline: true },
            { name: 'Current MP', value: '50/60', inline: true },
            { name: 'Current AC', value: '30/40', inline: true },
        )
        .addFields({ name: 'Current Status Effects: ', value: 'Silenced', inline: false })
        .setThumbnail('https://i.imgur.com/YptUuUC.png')


        const player = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('NAME OF THE CHARACTER')
        .setThumbnail('https://i.imgur.com/uYHRpii.png')//character portrait
        .addFields(
            // { name: '\u200B', value: '\u200B' },
            { name: 'Current HP', value: '100/120', inline: true },
            { name: 'Current MP', value: '50/60', inline: true },
            { name: 'Current AC', value: '30/40', inline: true },
            // { name: '\u200B', value: '\u200B' },
            // { name: 'Str', value: '10', inline: true, },
            // { name: 'Sta', value: '10', inline: true },
            // { name: 'Int', value: '6', inline: true },
            // { name: 'Dex', value: '5', inline: true },
            // { name: 'Agi', value: '8', inline: true },
            // { name: 'Wis', value: '3', inline: true },
            // { name: 'Lck', value: '5', inline: true },
            // { name: 'Cha', value: '1', inline: true },
            // { name: '\u200B', value: '\u200B' },
        )
        .addFields({ name: 'Current Status Effects: ', value: 'Silenced', inline: false })


    interaction.editReply({ embeds: [scene, mob, player], 
                            components: [row, row3, row4, row5], });

    } catch (error){
        console.log(error);
    };
}

export {
    data,
    execute
};