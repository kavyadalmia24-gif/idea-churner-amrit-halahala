import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { MessageSquare, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import WisdomLevel from "./WisdomLevel";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  userId: string;
  currentConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onNewChat: () => void;
  wisdomData: { churnCount: number; avgBVI: number };
}

const ChatSidebar = ({
  userId,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  wisdomData,
}: ChatSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Delete messages first
      await supabase.from("messages").delete().eq("conversation_id", id);
      // Then delete conversation
      const { error } = await supabase.from("conversations").delete().eq("id", id);
      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        onSelectConversation(null);
      }
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-card/30 backdrop-blur-sm border-r border-border/30 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="mb-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-card/30 backdrop-blur-sm border-r border-border/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Conversations</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conv.id
                    ? "bg-primary/20 border border-primary/30"
                    : "hover:bg-card/50"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate text-foreground">
                    {conv.title}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => deleteConversation(conv.id, e)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Wisdom Level at bottom */}
      {wisdomData.churnCount > 0 && (
        <div className="p-3 border-t border-border/30">
          <WisdomLevel churnCount={wisdomData.churnCount} avgBVI={wisdomData.avgBVI} compact />
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
