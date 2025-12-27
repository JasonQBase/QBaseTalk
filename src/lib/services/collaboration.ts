import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Room {
  id: string;
  name: string;
  topic: string;
  language_level: "Beginner" | "Intermediate" | "Advanced" | "All";
  created_by: string;
  created_at: string;
  participants_count: number;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: "text" | "audio";
  audio_url?: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface RoomParticipant {
  user_id: string;
  online_at: string;
  user_info: {
    full_name: string;
    avatar_url: string;
  };
}

/**
 * Get list of active rooms
 */
export async function getRooms(): Promise<Room[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }

  return data as Room[];
}

/**
 * Get a single room by ID
 */
export async function getRoom(roomId: string): Promise<Room | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) {
    console.error("Error fetching room:", error);
    return null;
  }

  return data as Room;
}

/**
 * Create a new room
 */
export async function createRoom(
  name: string,
  topic: string,
  level: string
): Promise<Room | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      name,
      topic,
      language_level: level,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating room:", error);
    return null;
  }

  return data as Room;
}

/**
 * Get messages for a room
 */
export async function getRoomMessages(roomId: string): Promise<Message[]> {
  // We need to join with users/profiles to get name/avatar
  // Assuming 'users_extended' or 'profiles' table exists and is linked via auth.users
  // For simplicity, we'll fetch messages and then maybe enrich them or assume public profile view

  // Actually, let's just fetch messages first
  // We fetch messages and then enrich them
  return await fetchMessagesSafe(roomId);
}

async function fetchMessagesSafe(roomId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("room_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  // Enrichment step (inefficient but safe if relations aren't set up)
  const enriched = await Promise.all(
    (data || []).map(
      async (msg: { user_id: string } & Record<string, unknown>) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", msg.user_id)
          .single();

        return {
          ...msg,
          user: {
            full_name: profile?.display_name || "Unknown User",
            avatar_url: profile?.avatar_url || "",
          },
        };
      }
    )
  );

  return enriched as Message[];
}

/**
 * Send a message
 */
export async function sendMessage(
  roomId: string,
  content: string,
  type: "text" | "audio" = "text",
  audioUrl?: string
): Promise<Message | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("room_messages")
    .insert({
      room_id: roomId,
      user_id: user.id,
      content,
      message_type: type,
      audio_url: audioUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }

  // Return with user info (optimistic or fetched)
  // For now return basic, client can append optimistic user info
  return data as Message;
}

/**
 * Subscribe to Room Events (Messages)
 */
export function subscribeToRoom(
  roomId: string,
  onMessage: (msg: Message) => void
): RealtimeChannel {
  const supabase = createClient();

  return supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "room_messages",
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        // Fetch user info for the new message
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", payload.new.user_id)
          .single();

        const msg: Message = {
          id: payload.new.id,
          room_id: payload.new.room_id,
          user_id: payload.new.user_id,
          content: payload.new.content,
          message_type: payload.new.message_type,
          audio_url: payload.new.audio_url,
          created_at: payload.new.created_at,
          user: {
            full_name: profile?.display_name || "Unknown",
            avatar_url: profile?.avatar_url || "",
          },
        };
        onMessage(msg);
      }
    )
    .subscribe();
}

/**
 * Subscribe to Presence (Who is online)
 */
export function subscribeToPresence(
  roomId: string,
  userId: string,
  userInfo: { full_name: string; avatar_url: string },
  onSync: (users: RoomParticipant[]) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase.channel(`presence:${roomId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const newState = channel.presenceState<RoomParticipant["user_info"]>();
      const participants: RoomParticipant[] = [];

      for (const key in newState) {
        // newState[key] is an array of presence objects for that key
        // We typically just take the first one if we key by userId
        const presence = newState[key][0];
        participants.push({
          user_id: key,
          online_at: new Date().toISOString(), // Approximation
          user_info: presence, // This matches the track payload
        });
      }
      onSync(participants);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track(userInfo);
      }
    });

  return channel;
}
