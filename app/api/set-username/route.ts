import { NextResponse } from "next/server";
import { setUsername } from "@/functions";

export async function POST(req: Request) {
    const { room, username } = await req.json();

    const userId = Math.random().toString(36).substring(7);
    await setUsername(room, userId, username);

    return NextResponse.json({ success: true, userId });
}