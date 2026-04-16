"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Key, Settings as SettingsIcon, Activity } from "lucide-react";
import { userApi } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

export default function SettingsPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    elevenLabsApiKey: "",
    name: ""
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await userApi.getSettings(getToken);
        setSettings({
          elevenLabsApiKey: data.elevenLabsApiKey || "",
          name: data.name || ""
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [getToken]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await userApi.updateSettings(settings, getToken);
      toast({
        title: "Settings saved",
        description: "Your API keys and profile information have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        
        {/* Header Section - High Contrast */}
        <section className="mb-10">
           <div className="flex items-center gap-5 mb-3">
              <div className="p-3 rounded-2xl gradient-primary shadow-glow">
                 <SettingsIcon className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-1">
                 <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">Settings <span className="text-primary italic font-medium">Hub.</span></h1>
                 <p className="text-muted-foreground font-medium">Manage your account identity and neural API integration.</p>
              </div>
           </div>
        </section>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-border/50 bg-background shadow-soft overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 rounded-lg bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                 </div>
                 <CardTitle className="text-xl font-bold tracking-tight">API Infrastructure</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground font-medium pl-10">
                Configure your external neural engines. These credentials are encrypted and stored in your secure vault.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-3 pl-10">
                <Label htmlFor="elevenlabs" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ElevenLabs API Key</Label>
                <Input
                  id="elevenlabs"
                  type="password"
                  placeholder="vault_pk_..."
                  value={settings.elevenLabsApiKey}
                  onChange={(e) => setSettings({ ...settings, elevenLabsApiKey: e.target.value })}
                  className="h-12 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all"
                />
                <p className="text-[10px] font-bold text-primary/70 uppercase tracking-tight">
                  Neural voice synthesis requires an active ElevenLabs uplink.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-border/50 bg-background shadow-soft overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Activity className="h-5 w-5 text-emerald-500" />
                 </div>
                 <CardTitle className="text-xl font-bold tracking-tight">Personal Dossier</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground font-medium pl-10">Update your public identity within the simulation network.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-3 pl-10">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Amit Paswan"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="h-12 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button 
                size="lg" 
                onClick={handleSave} 
                disabled={saving} 
                className="h-14 px-10 rounded-2xl font-bold gradient-primary shadow-glow hover:shadow-primary/40 transition-all gap-3"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Synchronize Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
