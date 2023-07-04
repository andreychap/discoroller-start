import 'dotenv/config';

import amqplib from 'amqplib';
import { Client, Events, GatewayIntentBits } from 'discord.js';

let connection;
let channel;

const connect = async () => {
    try {
        connection = await amqplib.connect(process.env.QUEUE_SERVER);
        channel = await connection.createChannel();

        await channel.assertQueue(process.env.QUEUE_NAME);
    } catch (error) {
        console.log(error);
    }
}

connect();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once(Events.ClientReady, (cl) => {
	console.log(`Ready! Logged in as ${cl.user.tag}`);
});

client.on(Events.GuildMemberAdd, (gm) => {
    let message = {
        type: 'guild:member:add',
        data: {
            memberId: gm.id,
            guildId: gm.guild.id
        }
    }

    channel.sendToQueue(
        process.env.QUEUE_NAME,
        Buffer.from(
            JSON.stringify({
                ...message,
                date: new Date(),
            }),
        ),
      )
});

client.login(process.env.BOT_TOKEN);
