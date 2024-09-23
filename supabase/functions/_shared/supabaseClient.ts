import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from './env'

// create a supabase client
export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
    )
