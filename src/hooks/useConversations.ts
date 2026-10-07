"use client";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";

export type Conversation = {
  _id: string;
  campaign: { _id: string; title: string } | null;
  otherUser: { _id: string; name: string; role: string };
  lastMessage: { body: string; createdAt: string } | null;
  unreadCount: number;
  updatedAt: string;
};

export type ChatMessage = { _id: string; body: string; sender: { _id: string; name: string }; isMine: boolean; createdAt: string; readAt?: string | null };

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; data: { conversations: Conversation[] } }>("/api/conversations");
      setConversations(res.data.conversations);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { conversations, loading, refetch };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; data: { messages: ChatMessage[] } }>(`/api/conversations/${conversationId}/messages`);
      setMessages(res.data.messages);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const send = useCallback(async (body: string) => {
    if (!conversationId) return;
    await apiRequest(`/api/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ body }) });
    await refetch();
  }, [conversationId, refetch]);

  return { messages, loading, refetch, send };
}
