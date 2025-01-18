import { NextResponse } from "next/server";
import { getLatestMessages } from "@/functions";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const room = searchParams.get("room");
        const lastTimestamp = parseInt(searchParams.get("lastTimestamp") || "0");

        if (!room)
            return NextResponse.json({ error: "Room is required" }, { status: 400 });

        const messages = await getLatestMessages(room, lastTimestamp);

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}