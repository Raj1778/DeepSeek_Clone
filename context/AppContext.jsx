"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export const AppContext = createContext();
export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const createNewChat = async () => {
    try {
      if (!user) return null;
      const token = await getToken();
      await axios.post(
        "/api/chat/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      toast.error(error?.message || "Failed to create new chat.");
    }
  };

  const fetchUsersChats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const chatList = data.data;

        if (chatList.length === 0) {
          // ✅ No chats exist – create one
          const createRes = await axios.post(
            "/api/chat/create",
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (createRes.data.success) {
            const newChat = createRes.data.data;
            setChats([newChat]);
            setSelectedChat(newChat);
          } else {
            toast.error(
              createRes.data.error || "Failed to create initial chat."
            );
          }

          return;
        }

        chatList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setChats(chatList);
        setSelectedChat(chatList[0]);
      } else {
        toast.error(data.error || "Failed to fetch chats.");
      }
    } catch (error) {
      toast.error(error?.message || "Error fetching user chats.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersChats();
    }
  }, [user]);

  const value = {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
