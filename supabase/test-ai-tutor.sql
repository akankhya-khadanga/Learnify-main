-- Test script to verify AI Tutor tables and queries work correctly

-- 1. Check if workspace_settings table exists and has data
SELECT 'Workspace Settings Count:' as test, COUNT(*) as count FROM workspace_settings;

-- 2. View all workspace settings
SELECT workspace_type, 
       LEFT(boundary_rules, 50) as boundary_preview,
       LEFT(preference_rules, 50) as preference_preview,
       created_at
FROM workspace_settings
ORDER BY workspace_type;

-- 3. Check if ai_tutor_queries table exists
SELECT 'Query History Count:' as test, COUNT(*) as count FROM ai_tutor_queries;

-- 4. View recent queries (if any)
SELECT workspace_type, 
       LEFT(query, 50) as query_preview,
       LEFT(response, 50) as response_preview,
       boundary_violated,
       created_at
FROM ai_tutor_queries
ORDER BY created_at DESC
LIMIT 10;

-- 5. Test inserting a sample query
INSERT INTO ai_tutor_queries (workspace_type, query, response, boundary_violated)
VALUES ('frontend', 'How do I use React hooks?', 'React hooks are functions that let you use state and lifecycle features...', false)
RETURNING id, workspace_type, created_at;

-- 6. Verify the insert worked
SELECT 'Queries After Insert:' as test, COUNT(*) as count FROM ai_tutor_queries;

-- 7. Query statistics per workspace
SELECT workspace_type, 
       COUNT(*) as total_queries,
       SUM(CASE WHEN boundary_violated THEN 1 ELSE 0 END) as violations,
       ROUND(100.0 * SUM(CASE WHEN boundary_violated THEN 1 ELSE 0 END) / COUNT(*), 2) as violation_rate
FROM ai_tutor_queries
GROUP BY workspace_type
ORDER BY total_queries DESC;

-- 8. Most common questions
SELECT workspace_type, query, COUNT(*) as ask_count
FROM ai_tutor_queries
GROUP BY workspace_type, query
ORDER BY ask_count DESC
LIMIT 10;

-- 9. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('workspace_settings', 'ai_tutor_queries')
ORDER BY tablename, policyname;
