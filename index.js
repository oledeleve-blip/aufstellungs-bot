const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

let lastMessage = null;

client.once('ready', () => {
    console.log(`Eingeloggt als ${client.user.tag}`);

    cron.schedule('0 21 * * *', async () => {

        const channel = await client.channels.fetch(CHANNEL_ID);

        if (lastMessage) {
            const message = await channel.messages.fetch(lastMessage.id);

            let anwesend = [];
            let abwesend = [];
            let spaeter = [];

            for (const reaction of message.reactions.cache.values()) {
                const users = await reaction.users.fetch();
                const filtered = users.filter(u => !u.bot);

                if (reaction.emoji.name === "🟢") anwesend = filtered;
                if (reaction.emoji.name === "🔴") abwesend = filtered;
                if (reaction.emoji.name === "🟡") spaeter = filtered;
            }

            await channel.send(
                `📊 **Auswertung der letzten Versammlung**\n\n` +
                `🟢 Anwesend (${anwesend.size}): ${anwesend.map(u => `<@${u.id}>`).join(", ") || "Niemand"}\n\n` +
                `🔴 Abwesend (${abwesend.size}): ${abwesend.map(u => `<@${u.id}>`).join(", ") || "Niemand"}\n\n` +
                `🟡 Komme später (${spaeter.size}): ${spaeter.map(u => `<@${u.id}>`).join(", ") || "Niemand"}`
            );
        }

        const heute = new Date().toLocaleDateString("de-DE");

        const message = await channel.send(
            `📢 **Tägliche Versammlung (${heute})**\n\n` +
            `Bitte reagieren:\n` +
            `🟢 = Anwesend\n` +
            `🔴 = Abwesend\n` +
            `🟡 = Komme später`
        );

        await message.react("🟢");
        await message.react("🔴");
        await message.react("🟡");

        lastMessage = message;

    }, {
        timezone: "Europe/Berlin"
    });
});

client.login(TOKEN);
console.log(process.env.TOKEN);
