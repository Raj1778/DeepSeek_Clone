"use client";
import { assets } from "@/assets/assets";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import PromptBox from "@/components/PromptBox";
import Messages from "@/components/Messages";
import { useAppContext } from "@/context/AppContext";

export default function Page() {
  const [expand, setExpand] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedChat } = useAppContext();
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [selectedChat?.messages]);

  return (
    <div className="flex h-screen">
      <Sidebar expand={expand} setExpand={setExpand} />
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
        <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
          <Image
            className="rotate-180"
            src={assets.menu_icon}
            alt=""
            onClick={() => setExpand((prev) => !prev)}
          />
          <Image className="opacity-70" src={assets.chat_icon} alt="" />
        </div>

        {!selectedChat?.messages?.length ? (
          <>
            <div className="flex items-center gap-3">
              <Image src={assets.logo_icon} alt="" className="h-16" />
              <p className="text-2xl font-medium">Hi, I'm DeepSeek.</p>
            </div>
            <p className="text-sm mt-2">How can I help you today?</p>
          </>
        ) : (
          <div
            ref={containerRef}
            className="relative flex flex-col items-center justify-start w-full mt-20 max-h-screen overflow-y-auto"
          >
            <p className="fixed top-8 border border-transparent hover:border-gray-500/50 py-1 px-2 rounded-lg font-semibold mb-6">
              {selectedChat.name}
            </p>
            {selectedChat.messages.map((msg, index) => (
              <Messages key={index} role={msg.role} content={msg.content} />
            ))}
            {isLoading && (
              <div className="flex gap-4 max-w-3xl w-full py-3">
                <Image
                  className="h-9 w-9 p-1 border border-white/15 rounded-full"
                  src={assets.logo_icon}
                  alt="logo"
                />
                <div className="loader flex justify-center items-center gap-1 ">
                  <div className="w-1 h-1 rounded-full bg-white animate-bounce" />
                  <div className="w-1 h-1 rounded-full bg-white animate-bounce" />
                  <div className="w-1 h-1 rounded-full bg-white animate-bounce" />
                </div>
              </div>
            )}
          </div>
        )}
        <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
        <p className="text-xs absolute bottom-1 text-gray-500">
          AI-generated, for reference only
        </p>
      </div>
    </div>
  );
}
