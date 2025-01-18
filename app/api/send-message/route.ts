import { NextResponse } from "next/server";
import { publishMessage, storeMessage } from "@/functions";

export async function POST(req: Request) {
    const { room, message, sender } = await req.json();

    const fullMessage = {
        sender,
        message,
        timestamp: Date.now(),
    };

    // uses publishMessage for immediate real-time delivery to active clients
    await publishMessage(room, fullMessage);
    // storeMessage to ensure message history is maintained for future retrieval
    await storeMessage(room, fullMessage);

    return NextResponse.json({ success: true });
}