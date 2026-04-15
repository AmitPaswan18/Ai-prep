"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Key, Settings as SettingsIcon } from "lucide-react";
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
    <div className="min-h-screen gradient-hero">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-primary-foreground">Settings</h1>
              <p className="text-primary-foreground/60">Manage your account and API configurations</p>
            </div>
          </div>

          <Card className="bg-card/10 backdrop-blur-xl border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Configure your external service credentials. These keys are stored securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="elevenlabs">ElevenLabs API Key</Label>
                <Input
                  id="elevenlabs"
                  type="password"
                  placeholder="Enter your ElevenLabs API key"
                  value={settings.elevenLabsApiKey}
                  onChange={(e) => setSettings({ ...settings, elevenLabsApiKey: e.target.value })}
                  className="bg-background/50 border-border/20"
                />
                <p className="text-xs text-primary-foreground/40">
                  Required for AI voice output in interviews. Find yours in ElevenLabs dashboard.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/10 backdrop-blur-xl border-border/20">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="bg-background/50 border-border/20"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
