import 'dotenv/config';

import express from 'express';
import amqplib from 'amqplib';

import { Client, Events, GatewayIntentBits } from 'discord.js';

const app = express();

let connection;
let channel;

const connect = async () => {
    try {
        connection = await amqplib.connect(process.env.QUEUE_SERVER);
        channel = await connection.createChannel();

        await channel.consume(process.env.QUEUE_NAME, (data) => {
            let content = JSON.parse(Buffer.from(data.content).toString());
            console.log('Received', content);
            
            processMessage(content);

            channel.ack(data);
        });
    } catch (err) {
        console.log(err);
    }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once(Events.ClientReady, (cl) => {
	console.log(`Ready! Logged in as ${cl.user.tag}`);
    connect();
});

client.login(process.env.BOT_TOKEN);

const processMessage = async (message) => {
    switch (message.type) {
        case 'guild:member:add':
            let member = await client.rest.patch(`/guilds/${message.data.guildId}/members/${message.data.memberId}`, {
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': {
                    'nick': 'Димооооооооон'
                }
            });
            console.log('member added', member);
            return;
        default:
            console.log('unknown action', message);
    }
}

app.use(express.json());

app.get('*', (req, res) => {
    res.status(404).send('Not Found');
});

app.listen(process.env.PORT);

