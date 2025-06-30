import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Chat from "@/models/Chat";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    await connectDB();

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return NextResponse.json({
        success: false,
        message: "Chat not found",
      });
    }

    const userMessage = {
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
    };
    chat.messages.push(userMessage);

    // 🧠 Call OpenRouter API (OpenAI-compatible)
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct", // or try "openchat/openchat-3.5-1210"
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "AI request failed");
    }

    const aiMessage = {
      role: "assistant",
      content: result.choices[0].message.content,
      timeStamp: Date.now(),
    };

    chat.messages.push(aiMessage);
    await chat.save();

    return NextResponse.json({
      success: true,
      data: aiMessage,
    });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}
