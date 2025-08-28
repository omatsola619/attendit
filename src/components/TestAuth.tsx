import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const TestAuth = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runAuthTest = async () => {
    setTesting(true);
    setResults(null);

    try {
      console.log('🧪 Starting auth test...');

      // Test 1: Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Test 1 - User:', user);
      console.log('Test 1 - Error:', userError);

      // Test 2: Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Test 2 - Session:', session);
      console.log('Test 2 - Error:', sessionError);

      // Test 3: Try a simple database operation
      const { data: testData, error: dbError } = await supabase
        .from('campaigns')
        .select('count(*)')
        .limit(1);
      console.log('Test 3 - DB Query:', testData);
      console.log('Test 3 - DB Error:', dbError);

      // Test 4: Try to insert a test campaign (will probably fail)
      const { data: insertData, error: insertError } = await supabase
        .from('campaigns')
        .insert({
          user_id: user?.id || 'test',
          title: 'Test Campaign',
          banner_url: 'https://example.com/test.jpg',
          banner_width: 800,
          banner_height: 600,
          placeholder_x: 100,
          placeholder_y: 100,
          placeholder_width: 200,
          placeholder_height: 200,
          placeholder_shape: 'rectangle'
        })
        .select()
        .single();
      console.log('Test 4 - Insert:', insertData);
      console.log('Test 4 - Insert Error:', insertError);

      const testResults = {
        user: user,
        userError: userError,
        session: session,
        sessionError: sessionError,
        dbQuery: testData,
        dbError: dbError,
        insertData: insertData,
        insertError: insertError
      };

      setResults(testResults);

      if (user) {
        toast.success("User is authenticated!");
      } else {
        toast.error("User is NOT authenticated!");
      }

    } catch (error) {
      console.error('Test failed:', error);
      toast.error("Test failed: " + (error as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">🧪 Authentication Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runAuthTest} disabled={testing}>
          {testing ? "Testing..." : "Run Auth Test"}
        </Button>

        {results && (
          <div className="text-xs space-y-2 bg-white p-3 rounded border">
            <div>
              <strong>User ID:</strong> {results.user?.id || "NULL"}
            </div>
            <div>
              <strong>Email:</strong> {results.user?.email || "NULL"}
            </div>
            <div>
              <strong>Session:</strong> {results.session ? "YES" : "NO"}
            </div>
            <div>
              <strong>DB Query Error:</strong> {results.dbError?.message || "None"}
            </div>
            <div>
              <strong>Insert Error:</strong> {results.insertError?.message || "None"}
            </div>
            <div>
              <strong>Insert Error Details:</strong> {results.insertError?.details || "None"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
