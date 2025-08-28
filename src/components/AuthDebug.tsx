import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const AuthDebug = () => {
  const { user, session, loading } = useAuth();

  return (
    <Card className="mt-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">🔍 Authentication Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant={loading ? "secondary" : "default"}>
            Loading: {loading ? "Yes" : "No"}
          </Badge>
          <Badge variant={user ? "default" : "destructive"}>
            User: {user ? "Authenticated" : "Not Authenticated"}
          </Badge>
          <Badge variant={session ? "default" : "destructive"}>
            Session: {session ? "Active" : "None"}
          </Badge>
        </div>
        
        {user && (
          <div className="space-y-1 text-xs">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? "Yes" : "No"}</p>
            <p><strong>Name:</strong> {user.user_metadata?.name || "Not set"}</p>
            <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
          </div>
        )}
        
        {session && (
          <div className="space-y-1 text-xs">
            <p><strong>Access Token:</strong> {session.access_token ? "Present" : "Missing"}</p>
            <p><strong>Expires At:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
          </div>
        )}
        
        {!user && !loading && (
          <p className="text-red-600 font-medium">⚠️ User not authenticated!</p>
        )}
      </CardContent>
    </Card>
  );
};
