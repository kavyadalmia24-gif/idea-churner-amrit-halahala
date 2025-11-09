import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WaveBackground from "@/components/WaveBackground";
import WisdomLevel from "@/components/WisdomLevel";
import { useWisdomTracking } from "@/hooks/useWisdomTracking";
import { ArrowLeft, LogOut, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChurnHistory {
  id: string;
  idea_text: string;
  idea_b_text: string | null;
  is_humanity_mode: boolean;
  amrit_view: string;
  halahala_view: string;
  bvi_score: number;
  shiva_mode: string;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<{ email: string; display_name: string } | null>(null);
  const [history, setHistory] = useState<ChurnHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { wisdomData } = useWisdomTracking();

  useEffect(() => {
    loadProfile();
    loadHistory();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("email, display_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast.error("Failed to load profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("churn_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error("Failed to load history:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("churn_history")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setHistory(history.filter(h => h.id !== id));
      toast.success("History entry deleted");
    } catch (error: any) {
      toast.error("Failed to delete entry");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <WaveBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Churner
          </Button>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="mb-8 bg-background/95 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient-gold">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4">
              <WisdomLevel 
                churnCount={wisdomData.churnCount} 
                avgBVI={wisdomData.avgBVI}
              />
            </div>
            <div>
              <span className="text-muted-foreground">Name: </span>
              <span className="font-medium">{profile?.display_name || "Not set"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              <span className="font-medium">{profile?.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Churns: </span>
              <span className="font-medium">{history.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card className="bg-background/95 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient-gold">Churn History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No churns yet. Start churning ideas to build your history!
              </p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="border border-border/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {item.idea_b_text ? "Comparison" : item.is_humanity_mode ? "Humanity Mode" : "Single Idea"}
                        </h3>
                        <span className={`text-sm px-2 py-0.5 rounded ${
                          item.bvi_score >= 71 ? "bg-green-500/20 text-green-300" :
                          item.bvi_score >= 41 ? "bg-yellow-500/20 text-yellow-300" :
                          "bg-red-500/20 text-red-300"
                        }`}>
                          BVI: {item.bvi_score}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {item.idea_text}
                      </p>
                      {item.idea_b_text && (
                        <p className="text-sm text-muted-foreground italic">
                          vs. {item.idea_b_text}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
