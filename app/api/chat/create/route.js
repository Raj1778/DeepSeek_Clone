import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
    };

    await connectDB();
    const newChat = await Chat.create(chatData);

    return NextResponse.json({
      success: true,
      message: "Chat created",
      data: newChat, // ✅ return chat data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
