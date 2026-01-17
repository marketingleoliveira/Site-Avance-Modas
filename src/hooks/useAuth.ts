import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const adminStatus = await checkAdminRole(session.user.id);
          if (isMounted) {
            setIsAdmin(adminStatus);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing session:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential race conditions with the database
          setTimeout(async () => {
            if (!isMounted) return;
            const adminStatus = await checkAdminRole(session.user.id);
            if (isMounted) {
              setIsAdmin(adminStatus);
              setLoading(false);
            }
          }, 100);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    
    if (!error && data.user) {
      // Immediately check admin status after successful login
      const adminStatus = await checkAdminRole(data.user.id);
      setIsAdmin(adminStatus);
    }
    
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setIsAdmin(false);
    setLoading(false);
  };

  return { user, session, loading, isAdmin, signIn, signOut };
}
