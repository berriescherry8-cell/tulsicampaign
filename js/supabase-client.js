// ============================================================================
// TULSI KIDS SCHOOL - GREEN DIWALI CAMPAIGN
// Supabase Client Configuration
// ============================================================================
// IMPORTANT: Replace these with your actual Supabase project credentials
// Get them from: Supabase Dashboard → Project Settings → API
// ============================================================================

const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Initialize Supabase client
let supabase = null;

function initSupabase() {
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
        console.error('Supabase library not loaded. Make sure to include the Supabase CDN script.');
        return null;
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabase;
}

function getSupabase() {
    if (!supabase) {
        supabase = initSupabase();
    }
    return supabase;
}

// ============================================================================
// Database Operations
// ============================================================================

// Table: entries
// Columns: id (uuid, primary key), name (text), city (text), class_section (text),
//          certificate_generated (boolean, default false), certificate_url (text),
//          created_at (timestamp with time zone, default now())

// Submit a new entry (from certificate form)
async function submitEntry(entryData) {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('entries')
        .insert([{
            name: entryData.name,
            city: entryData.city,
            class_section: entryData.class_section || '',
            certificate_generated: false,
            certificate_url: null,
            created_at: new Date().toISOString()
        }])
        .select();
    
    if (error) throw error;
    return data[0];
}

// Get all entries (for admin panel)
async function getAllEntries() {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
}

// Get a single entry by ID
async function getEntryById(id) {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('entries')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) throw error;
    return data;
}

// Update entry (mark certificate as generated, store certificate URL)
async function updateEntry(id, updates) {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('entries')
        .update(updates)
        .eq('id', id)
        .select();
    
    if (error) throw error;
    return data[0];
}

// Delete an entry
async function deleteEntry(id) {
    const sb = getSupabase();
    const { error } = await sb
        .from('entries')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
}

// ============================================================================
// Certificate Storage (optional: store generated certificate images)
// ============================================================================

// Upload certificate image to Supabase Storage
async function uploadCertificateImage(file, entryId) {
    const sb = getSupabase();
    const fileName = `certificates/${entryId}/${file.name}`;
    const { data, error } = await sb.storage
        .from('certificates')
        .upload(fileName, file);
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = sb.storage
        .from('certificates')
        .getPublicUrl(fileName);
    
    return urlData.publicUrl;
}

export { initSupabase, getSupabase, submitEntry, getAllEntries, getEntryById, updateEntry, deleteEntry, uploadCertificateImage };