import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const SimpleAuthTest = () => {
  const { user: contextUser } = useAuth();
  const [directUser, setDirectUser] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const testDirectAuth = async () => {
    setTesting(true);
    try {
      console.log("🔍 Testing direct Supabase auth...");
      
      // Test 1: Direct supabase.auth.getUser()
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log("Direct user:", user);
      console.log("Direct error:", error);
      
      // Test 2: Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Session:", session);
      console.log("Session error:", sessionError);
      
      // Test 3: Check environment variables
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
      console.log("Anon Key (first 20 chars):", import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20));
      
      setDirectUser(user);
      
      if (user) {
        toast.success("Direct auth test passed!");
      } else {
        toast.error("Direct auth test failed - user is null");
      }
      
    } catch (error) {
      console.error("Auth test error:", error);
      toast.error("Auth test error: " + (error as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800">🔍 Simple Auth Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Context User:</strong>
            <div className="text-xs text-muted-foreground">
              {contextUser ? `✅ ${contextUser.email}` : "❌ NULL"}
            </div>
          </div>
          <div>
            <strong>Direct User:</strong>
            <div className="text-xs text-muted-foreground">
              {directUser ? `✅ ${directUser.email}` : "❌ NULL"}
            </div>
          </div>
        </div>

        <Button onClick={testDirectAuth} disabled={testing} className="w-full">
          {testing ? "Testing..." : "Test Direct Supabase Auth"}
        </Button>

        <div className="text-xs space-y-1">
          <div><strong>Environment Check:</strong></div>
          <div>URL: {import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</div>
          <div>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</div>
        </div>

        {contextUser && (
          <div className="bg-white p-2 rounded text-xs">
            <strong>User Details:</strong>
            <div>ID: {contextUser.id}</div>
            <div>Email: {contextUser.email}</div>
            <div>Confirmed: {contextUser.email_confirmed_at ? "Yes" : "No"}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
