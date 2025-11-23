import { supabase } from './_supabase.js';
import { verifyJwt } from './auth.js';

export default async function handler(req, res) {
    // Only allow GET for fetching incidents
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify JWT
    await verifyJwt(req, res, async () => {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(200).json(data);
    });
}
