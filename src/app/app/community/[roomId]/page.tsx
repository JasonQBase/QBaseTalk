"use client";

import { useState, useEffect, useRef, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Mic, Users, ArrowLeft } from "lucide-react";
import {
  getRoom,
  getRoomMessages,
  sendMessage,
  subscribeToRoom,
  subscribeToPresence,
  type Room,
  type Message,
  type RoomParticipant,
} from "@/lib/services/collaboration";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

// Avatar Component if missing, we use standard image/div fallback
// Assuming Avatar component exists or I'll use simple div
// I'll check components/ui/avatar if it exists, otherwise I'll stick to div

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const router = useRouter();
  // Unwrap params using React.use() in Next.js 15+
  const { roomId } = use(params);

  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showParticipants, setShowParticipants] = useState(false); // Mobile toggle

  useEffect(() => {
    let roomChannel: ReturnType<typeof subscribeToRoom> | null = null;
    let presenceChannel: ReturnType<typeof subscribeToPresence> | null = null;

    async function initializeRoom() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        setCurrentUser(user);

        // Fetch Room Info
        const roomData = await getRoom(roomId);
        if (!roomData) {
          return;
        }
        setRoom(roomData);

        // Fetch History
        const history = await getRoomMessages(roomId);
        setMessages(history);

        // Subscribe to New Messages
        roomChannel = subscribeToRoom(roomId, (msg) => {
          setMessages((prev) => [...prev, msg]);
        });

        // Subscribe to Presence
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .single();

        presenceChannel = subscribeToPresence(
          roomId,
          user.id,
          {
            full_name: profile?.display_name || "User",
            avatar_url: profile?.avatar_url || "",
          },
          (users) => {
            setParticipants(users);
          }
        );
      } catch (error) {
        console.error("Error initializing room:", error);
      } finally {
        setLoading(false);
      }
    }

    initializeRoom();

    return () => {
      // Cleanup subscriptions
      if (roomChannel) roomChannel.unsubscribe();
      if (presenceChannel) presenceChannel.unsubscribe();
    };
  }, [roomId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    // Optimistic Update
    // We don't add strictly optimistically because we wait for server ACK in sendMessage
    // But for UI responsiveness we clear input immediately
    const content = newMessage;
    setNewMessage("");

    await sendMessage(roomId, content);
    // The subscription will handle adding it to the list
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading room...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-screen items-center justify-center">
        Room not found
      </div>
    );
  }

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Link href="/app/community">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">{room.name}</h1>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {participants.length} online
              </span>
              <span>•</span>
              <span>{room.topic}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowParticipants(!showParticipants)}
        >
          <Users className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat */}
        <main className="relative flex w-full flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg, idx) => {
              const isMe = msg.user_id === currentUser?.id;
              const showAvatar =
                idx === 0 || messages[idx - 1].user_id !== msg.user_id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && showAvatar && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.user?.avatar_url} />
                      <AvatarFallback>
                        {(msg.user?.full_name || "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isMe && !showAvatar && <div className="w-8 shrink-0" />}

                  <div
                    className={`max-w-[70%] rounded-2xl p-3 ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    }`}
                  >
                    {!isMe && showAvatar && (
                      <div className="mb-1 text-xs font-bold opacity-70">
                        {msg.user?.full_name}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <div
                      className={`mt-1 text-right text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-background/95 border-t p-4 backdrop-blur-sm">
            <form
              className="mx-auto flex max-w-4xl items-center gap-2"
              onSubmit={handleSendMessage}
            >
              <div className="relative flex-1">
                <Input
                  className="bg-muted/50 border-0 pr-12 focus-visible:ring-1"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </main>

        {/* Sidebar (Desktop: Block, Mobile: Overlay/Hidden) */}
        <aside
          className={` ${showParticipants ? "flex" : "hidden"} bg-muted/10 absolute right-0 z-20 h-full w-64 flex-col border-l md:relative md:flex`}
        >
          <div className="border-b p-4 font-medium">Participants</div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {participants.map((p) => (
              <div key={p.user_id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p.user_info?.avatar_url} />
                  <AvatarFallback>
                    {(p.user_info?.full_name || "?")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {p.user_info?.full_name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    Online
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
