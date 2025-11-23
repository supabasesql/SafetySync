import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase client – replace with your own URL and anon key (already in .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile
    const fetchProfile = async (userId) => {
        if (!userId) {
            setProfile(null);
            return;
        }
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)  // Changed from user_id to id
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }
            console.log('✅ Fetched profile:', data); // Debug log
            setProfile(data || null);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            fetchProfile(session?.user?.id);
            setLoading(false);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            fetchProfile(session?.user?.id);
            setLoading(false);
        });
        // Cleanup
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email, password) => {
        const { error, data } = await supabase.auth.signUp({ email, password });
        console.log('Supabase signUp response:', data);
        if (error) throw error;
        return data;
    };

    const signIn = async (email, password) => {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data.user;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setProfile(null);
    };

    // Placeholder for password reset – UI only for now
    const resetPassword = async (email) => {
        // Supabase provides a reset‑password email flow; we just expose the call.
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    };

    // Role utility functions
    const hasRole = (role) => {
        if (!profile) return false;
        if (Array.isArray(role)) {
            return role.includes(profile.role);
        }
        return profile.role === role;
    };

    const isAdmin = () => hasRole('admin');
    const isManager = () => hasRole(['admin', 'manager']);
    const canCreateIncident = () => hasRole(['admin', 'manager', 'user']);
    const canDeleteIncident = () => hasRole(['admin', 'manager']);
    const canManageUsers = () => hasRole('admin');

    return (
        <AuthContext.Provider value={{
            user,
            session,
            profile,
            loading,
            signUp,
            signIn,
            signOut,
            resetPassword,
            hasRole,
            isAdmin,
            isManager,
            canCreateIncident,
            canDeleteIncident,
            canManageUsers,
            fetchProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};
