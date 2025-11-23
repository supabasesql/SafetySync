import { createClient } from '@supabase/supabase-js';

// Supabase client – reuse same env vars as server.js
const supabaseUrl = process.env.SUPABASE_URL || 'https://bxhxrvdovyumxwderrsg.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aHhydmRvdnl1bXh3ZGVycnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTEyNTIsImV4cCI6MjA3ODE4NzI1Mn0.x3K7yAqC_xavDthiqKNlEI6_SdhD8QYzBipSpo48VzU';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Express middleware to verify Supabase JWT.
 * It expects the Authorization header: "Bearer <token>".
 * On success, attaches `req.user` (Supabase user object) and calls next().
 */
export async function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid Authorization header format' });
    }
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = data.user; // { id, email, ... }
    next();
}
