
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rmwtutotjirhyilgoclr.supabase.co';
const supabaseAnonKey = 'sb_publishable_wLWurB4JJu5eBM-yV4or4Q_bd1ePqoD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
