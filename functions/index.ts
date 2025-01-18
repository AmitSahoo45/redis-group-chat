import { redisConnection } from "@/lib/redis";

/**
 * @param room 
 * @param message 
 * Sends a message to all the subscribers of a redis channel. This is a publisher. This will publish a message to all the subscribers of a given channel and this channel is that room. This room is the chat conversation room. 
 */
export const publishMessage = async (room: string, message: Message) => await redisConnection.publish(room, JSON.stringify(message));


/**
 * 1. **lpush**: Inserts the JSON-serialized message at the start (left-hand side) of the list.
 *    For example, if your list currently is [m4, m3, m2, m1] and you insert m5,
 *    the list becomes [m5, m4, m3, m2, m1].
 *
 * 2. **ltrim**: Trims the list so that only the most recent 100 messages are kept.
 *    Specifically, it retains only the messages with indices 0 through 99,
 *    removing any older messages (if present) beyond that range.
 * @param room 
 * @param message 
 */
export const storeMessage = async (room: string, message: Message) => {
    const key = `chat:${room}`;
    await redisConnection.lpush(key, JSON.stringify(message));
    await redisConnection.ltrim(key, 0, 99);
}


/**
 * 
 * @param room 
 * @returns 
 */
export const getMessages = async (room: string): Promise<Message[]> => {
    const messages = await redisConnection.lrange<Message>(`chat:${room}`, 0, -1);
    /*
    Retrieves a range of messages from the chat history stored in Redis. In this example, the `lrange` command retrieves all messages from the list stored at the key `chat:${room}`. The parameters 0 and -1 specify the start and end of the range: 
    - **0**: Start at the first element of the list.
    - **-1**: End at the last element of the list.
    Essentially, this command fetches the entire list of chat messages for the room.
    */

    return messages
        .map((msg) => {
            try {
                return {
                    sender: msg.sender || "Unknown",
                    message: msg.message || "",
                    timestamp: msg.timestamp || Date.now()
                };
            } catch (error) {
                console.error("Error parsing message:", msg);
                console.error(error);
                return null;
            }
        })
        .filter((msg): msg is Message => msg !== null);
}


export const getLatestMessages = async (room: string, lastTimestamp: number): Promise<Message[]> => {
    const messages = await getMessages(room);
    return messages.filter((msg) => msg.timestamp > lastTimestamp);
}

export const setUsername = async (room: string, userId: string, username: string): Promise<void> => {
    await redisConnection.hset(`users:${room}`, { [userId]: username });
};

export const getUsername = async (room: string, userId: string): Promise<string> => {
    const username = (await redisConnection.hget(`users:${room}`, userId)) as string | null;
    return username ?? "Anonymous";
}
