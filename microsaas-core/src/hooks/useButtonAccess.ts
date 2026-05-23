import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useButtonAccess(buttonId: string) {
    const [allowed, setAllowed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAccess() {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('user_button_access')
                .select('is_unlocked')
                .eq('user_id', session.user.id)
                .eq('button_id', buttonId)
                .single();

            setAllowed(data?.is_unlocked || false);
            setLoading(false);
        }
        checkAccess();
    }, [buttonId]);

    return { allowed, loading };
}
