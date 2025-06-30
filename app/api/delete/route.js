import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { connect } from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }
    //Connect to db and delete chat
    await connectDB();
    await Chat.deleteOne({ _id: chatId, userId });
    return NextResponse.json({ success: false, error: error.message });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
