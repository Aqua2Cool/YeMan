import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DISCORD_USER_ID = '1278980523578101775';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ]
});

let cachedPresence = null;

client.on('ready', async () => {
    console.log('Discord bot is ready!');
    await updatePresenceData();
});

async function updatePresenceData() {
    for (const guild of client.guilds.cache.values()) {
        try {
            const member = await guild.members.fetch(DISCORD_USER_ID);
            if (member && member.presence) {
                cachedPresence = {
                    status: member.presence.status,
                    activities: member.presence.activities || []
                };
                break;
            }
        } catch (error) {
            continue;
        }
    }
}

client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (newPresence.userId === DISCORD_USER_ID) {
        cachedPresence = {
            status: newPresence.status,
            activities: newPresence.activities || []
        };
    }
});

app.get('/api/discord-presence', async (req, res) => {
    try {
        const user = await client.users.fetch(DISCORD_USER_ID, { force: true });
        await updatePresenceData();

        const presence = cachedPresence || { status: 'offline', activities: [] };
        
        const responseData = {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            status: presence.status,
            activities: presence.activities.map(activity => ({
                name: activity.name,
                type: activity.type,
                details: activity.details,
                state: activity.state,
                timestamps: activity.timestamps,
                assets: activity.assets
            }))
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch Discord presence' });
    }
});

client.login(DISCORD_BOT_TOKEN);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 