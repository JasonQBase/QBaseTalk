"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Users, Globe, MessageCircle } from "lucide-react";
import { getRooms, createRoom, type Room } from "@/lib/services/collaboration";
import Link from "next/link";

export default function CommunityPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Create Room Form
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomTopic, setNewRoomTopic] = useState("");
  const [newRoomLevel, setNewRoomLevel] = useState("All");

  useEffect(() => {
    async function loadRooms() {
      setLoading(true);
      const data = await getRooms();
      setRooms(data);
      setLoading(false);
    }
    loadRooms();

    // Subscribe to room changes (new rooms)
    // For simplicity, just polling or manual refresh on create for now
    // But ideally we use realtime for rooms list too.
    // The service supports it if we add a subscription.
  }, []);

  async function handleCreateRoom() {
    if (!newRoomName || !newRoomTopic) return;

    const room = await createRoom(newRoomName, newRoomTopic, newRoomLevel);
    if (room) {
      setRooms([room, ...rooms]);
      setIsCreateOpen(false);
      setNewRoomName("");
      setNewRoomTopic("");
    }
  }

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Community Rooms</h1>
            <p className="text-muted-foreground">
              Join a study group and practice English with others in real-time.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-primary/20 gap-2 shadow-lg">
                <Plus className="h-4 w-4" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Study Room</DialogTitle>
                <DialogDescription>
                  Start a new topic-based room for others to join.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Room Name</Label>
                  <Input
                    placeholder="e.g. Morning Coffee Chat"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input
                    placeholder="e.g. Casual conversation, Business, Travel"
                    value={newRoomTopic}
                    onChange={(e) => setNewRoomTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <select
                    className="border-input bg-background ring-offset-background w-full rounded-md border px-3 py-2 text-sm"
                    value={newRoomLevel}
                    onChange={(e) => setNewRoomLevel(e.target.value)}
                  >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateRoom}>Create Room</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            className="h-12 pl-10 text-lg"
            placeholder="Search for rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="text-muted-foreground py-12 text-center">
            Loading rooms...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-xl border border-dashed py-12 text-center">
            <h3 className="mb-2 text-lg font-medium">No rooms found</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to create one!
            </p>
            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
              Create Room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
              >
                <Link href={`/app/community/${room.id}`}>
                  <Card className="hover:border-primary/50 bg-card border-border/40 h-full cursor-pointer p-6 transition-colors">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="bg-primary/10 text-primary rounded-xl p-3">
                        <Globe className="h-6 w-6" />
                      </div>
                      <Badge
                        variant={
                          room.language_level === "Advanced"
                            ? "advanced"
                            : room.language_level === "Intermediate"
                              ? "intermediate"
                              : room.language_level === "Beginner"
                                ? "beginner"
                                : "secondary"
                        }
                      >
                        {room.language_level}
                      </Badge>
                    </div>

                    <h3 className="mb-2 text-xl font-bold">{room.name}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                      Topic:{" "}
                      <span className="text-foreground">{room.topic}</span>
                    </p>

                    <div className="text-muted-foreground mt-auto flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{room.participants_count || 0} online</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>Active</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
