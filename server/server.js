import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { verifyJwt } from './middleware/auth.js';

const app = express();
const PORT = 3001;

// Supabase Configuration
// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// Apply JWT verification to all API routes
app.use('/api', verifyJwt);

// Middleware to check user role
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('user_id', userId)
                .single();

            if (error || !profile) {
                return res.status(403).json({ error: 'Access denied: Profile not found' });
            }

            if (!allowedRoles.includes(profile.role)) {
                return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
            }

            req.userRole = profile.role;
            next();
        } catch (error) {
            console.error('Error checking role:', error);
            res.status(500).json({ error: error.message });
        }
    };
};

// Get all incidents (only incidents belonging to the authenticated user)
app.get('/api/incidents', async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching incidents:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create new incident (associate with authenticated user)
app.post('/api/incidents', async (req, res) => {
    try {
        const userId = req.user.id;
        const incidentData = {
            category: req.body.category,
            severity: req.body.severity,
            location: req.body.location,
            department: req.body.department,
            description: req.body.description,
            immediate_action: req.body.immediateAction || '',
            status: 'open',
            user_id: userId,
        };
        const { data, error } = await supabase
            .from('incidents')
            .insert([incidentData])
            .select()
            .single();
        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        console.log('✅ Successfully created incident:', data);
        res.json({ success: true, incident: data });
    } catch (error) {
        console.error('💥 Error creating incident:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Update incident (only if it belongs to the authenticated user)
app.put('/api/incidents/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('incidents')
            .update(req.body)
            .eq('id', req.params.id)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) throw error;
        res.json({ success: true, incident: data });
    } catch (error) {
        console.error('Error updating incident:', error);
        res.status(500).json({ error: error.message });
    }
});

// Profile endpoints
app.get('/api/profile', async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        res.json(data || {});
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/profile', async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        // Users cannot change their own role via this endpoint
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ user_id: userId, name }, { onConflict: 'user_id' })
            .select()
            .single();
        if (error) throw error;
        res.json({ success: true, profile: data });
    } catch (error) {
        console.error('Error upserting profile:', error);
        res.status(500).json({ error: error.message });
    }
});

// =====================================================
// User Management Endpoints (Admin only)
// =====================================================

// Get all users (Admin only)
app.get('/api/users', requireRole(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('user_id, name, role, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Get email from auth.users for each profile
        const usersWithEmails = await Promise.all(
            data.map(async (profile) => {
                const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.user_id);
                return {
                    ...profile,
                    email: user?.email || 'N/A'
                };
            })
        );

        res.json(usersWithEmails);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update user role (Admin only)
app.patch('/api/users/:id/role', requireRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        const validRoles = ['admin', 'manager', 'user', 'viewer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('user_id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, profile: data });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific user (Admin or self)
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if user is admin or requesting their own profile
        const { data: requesterProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', userId)
            .single();

        if (requesterProfile?.role !== 'admin' && userId !== id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', id)
            .single();

        if (error) throw error;

        // Get email from auth.users
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(id);

        res.json({
            ...data,
            email: user?.email || 'N/A'
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ SafetySync API running on http://localhost:${PORT}`);
    console.log('🗄️  Connected to Supabase database');
});
