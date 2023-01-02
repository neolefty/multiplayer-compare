import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "missing from config"
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "missing from config"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
