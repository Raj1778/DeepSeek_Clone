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

  const fetchUsersChats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const chatList = data.data;

        if (chatList.length === 0) {
          // No chats exist – create one
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

        // Sort by most recently updated
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
  const createNewChat = async () => {
    try {
      if (!user) return null;
      const token = await getToken();

      const { data } = await axios.post(
        "/api/chat/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        const newChat = data.data;

        // Fetch updated list of chats
        const res = await axios.get("/api/chat/get", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const chatList = res.data.data;
          chatList.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          setChats(chatList);

          // ✅ Set selectedChat to the one we just created
          const found = chatList.find((chat) => chat._id === newChat._id);
          if (found) setSelectedChat(found);
          else setSelectedChat(chatList[0]); // fallback
        }
      } else {
        toast.error(data.error || "Failed to create new chat.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to create new chat.");
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
