import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_URL,
    token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_TOKEN,
})

export const publishMessage = async (room: string, message: Message) => await redis.publish(room, JSON.stringify(message));

export const storeMessage = async (room: string, message: Message) => {
    const key = `chat:${room}`;
    await redis.lpush(key, JSON.stringify(message));
    await redis.ltrim(key, 0, 99);
}

export const getMessages = async (room: string): Promise<Message[]> => {
    const rawMessages = await redis.lrange(`chat:${room}`, 0, -1);
    const parsedMessages: Message[] = [];

    for (const raw of rawMessages) {
        try {
            const { sender = "Unknown", message = "", timestamp = Date.now() } = JSON.parse(raw);
            parsedMessages.push({ sender, message, timestamp });
        } catch (error) {
            console.error("Error parsing message:", raw, error);
        }
    }

    return parsedMessages;
}


export const getLatestMessages = async (room: string, lastTimestamp: number): Promise<Message[]> => {
    const allMessages = await getMessages(room);
    return allMessages.filter((msg) => msg.timestamp > lastTimestamp);
}

export const setUsername = async (room: string, userId: string, username: string): Promise<void> => {
    await redis.hset(`users:${room}`, { [userId]: username });
};

export const getUsername = async (room: string, userId: string): Promise<string> => {
    const username = (await redis.hget(`users:${room}`, userId)) as string | null;
    return username ?? "Anonymous";
}
