import { supabase, supabaseAdmin } from '../../config/supabase.js';
import { hasSupabaseConfig } from '../../config/env.js';
import { DEV_DEFAULT_FARMER_ID } from '../../middleware/auth.js';
import crypto from 'crypto';

// In-memory persistent state for local development when Supabase Cloud is not yet configured
const inMemoryStore = {
  profiles: new Map([
    [
      DEV_DEFAULT_FARMER_ID,
      {
        id: DEV_DEFAULT_FARMER_ID,
        full_name: 'Kisan Patel',
        phone: '+91 9876543210',
        state: 'Karnataka',
        district: 'Mandya',
        village: 'Keregodu',
        preferred_language: 'en',
        farming_experience: 12,
        total_agricultural_land: 5.5,
        land_measurement_unit: 'acres',
        farming_type: 'mixed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  ]),
  plots: new Map([
    [
      '00000000-0000-0000-0000-000000000101',
      {
        id: '00000000-0000-0000-0000-000000000101',
        farmer_id: DEV_DEFAULT_FARMER_ID,
        plot_name: 'North Canal Field',
        area: 3.5,
        area_unit: 'acres',
        soil_type: 'Clay Loam',
        irrigation_source: 'Canal & Borewell',
        location: 'Plot 4, Canal Road',
        latitude: 12.5218,
        longitude: 76.8951,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    [
      '00000000-0000-0000-0000-000000000102',
      {
        id: '00000000-0000-0000-0000-000000000102',
        farmer_id: DEV_DEFAULT_FARMER_ID,
        plot_name: 'South Orchard',
        area: 2.0,
        area_unit: 'acres',
        soil_type: 'Red Loam',
        irrigation_source: 'Drip Irrigation',
        location: 'Near Old Mango Grove',
        latitude: 12.5240,
        longitude: 76.8980,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  ]),
  soil_records: new Map([
    [
      '00000000-0000-0000-0000-000000000201',
      {
        id: '00000000-0000-0000-0000-000000000201',
        farmer_id: DEV_DEFAULT_FARMER_ID,
        plot_id: '00000000-0000-0000-0000-000000000101',
        nitrogen: 240,
        phosphorus: 18,
        potassium: 210,
        ph: 6.8,
        moisture: 42,
        temperature: 26,
        organic_carbon: 0.65,
        soil_texture: 'Clay Loam',
        test_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      },
    ],
  ]),
  crop_recommendations: new Map(),
  disease_diagnoses: new Map(),
  fertilizer_plans: new Map(),
  chat_conversations: new Map([
    [
      '00000000-0000-0000-0000-000000000301',
      {
        id: '00000000-0000-0000-0000-000000000301',
        farmer_id: DEV_DEFAULT_FARMER_ID,
        title: 'Initial Crop Consultation',
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  ]),
  chat_messages: new Map([
    [
      '00000000-0000-0000-0000-000000000401',
      {
        id: '00000000-0000-0000-0000-000000000401',
        conversation_id: '00000000-0000-0000-0000-000000000301',
        farmer_id: DEV_DEFAULT_FARMER_ID,
        role: 'assistant',
        content: 'Welcome to AgriPulse AI! I am ready to advise you on crops, soil nutrition, pest management, and weather for your plots.',
        metadata: { intent: 'welcome' },
        created_at: new Date().toISOString(),
      },
    ],
  ]),
  weather_records: new Map(),
};

const getClient = () => supabaseAdmin || supabase;

// --- PROFILES ---
export const getProfile = async (farmerId) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client.from('profiles').select('*').eq('id', farmerId).maybeSingle();
    if (error) throw error;
    if (!data) {
      // Auto-create initial profile row if missing
      const newProfile = {
        id: farmerId,
        full_name: 'Farmer',
        preferred_language: 'en',
      };
      const { data: inserted, error: insertErr } = await client.from('profiles').insert(newProfile).select().single();
      if (!insertErr && inserted) return inserted;
    }
    return data;
  }
  return inMemoryStore.profiles.get(farmerId) || {
    id: farmerId,
    full_name: 'Farmer',
    preferred_language: 'en',
  };
};

export const updateProfile = async (farmerId, updates) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('profiles')
      .upsert({ id: farmerId, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const existing = inMemoryStore.profiles.get(farmerId) || { id: farmerId };
  const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
  inMemoryStore.profiles.set(farmerId, updated);
  return updated;
};

// --- PLOTS ---
export const getPlots = async (farmerId) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('plots')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return Array.from(inMemoryStore.plots.values()).filter((p) => p.farmer_id === farmerId);
};

export const getPlotById = async (farmerId, plotId) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('plots')
      .select('*')
      .eq('id', plotId)
      .eq('farmer_id', farmerId)
      .single();
    if (error) return null;
    return data;
  }
  const plot = inMemoryStore.plots.get(plotId);
  return plot && plot.farmer_id === farmerId ? plot : null;
};

export const createPlot = async (farmerId, plotData) => {
  const newPlot = {
    ...plotData,
    farmer_id: farmerId,
  };

  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client.from('plots').insert(newPlot).select().single();
    if (error) throw error;
    return data;
  }

  const id = crypto.randomUUID();
  const created = {
    id,
    ...newPlot,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemoryStore.plots.set(id, created);
  return created;
};

export const updatePlot = async (farmerId, plotId, updates) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('plots')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', plotId)
      .eq('farmer_id', farmerId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const existing = inMemoryStore.plots.get(plotId);
  if (!existing || existing.farmer_id !== farmerId) return null;
  const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
  inMemoryStore.plots.set(plotId, updated);
  return updated;
};

export const deletePlot = async (farmerId, plotId) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { error } = await client.from('plots').delete().eq('id', plotId).eq('farmer_id', farmerId);
    if (error) throw error;
    return true;
  }

  const existing = inMemoryStore.plots.get(plotId);
  if (!existing || existing.farmer_id !== farmerId) return false;
  inMemoryStore.plots.delete(plotId);
  return true;
};

// --- SOIL RECORDS ---
export const getSoilRecordsByPlot = async (farmerId, plotId) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    let query = client.from('soil_records').select('*').eq('farmer_id', farmerId);
    if (plotId) query = query.eq('plot_id', plotId);
    query = query.order('test_date', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  return Array.from(inMemoryStore.soil_records.values()).filter(
    (s) => s.farmer_id === farmerId && (!plotId || s.plot_id === plotId)
  );
};

export const createSoilRecord = async (farmerId, recordData) => {
  const newRecord = {
    ...recordData,
    farmer_id: farmerId,
  };

  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client.from('soil_records').insert(newRecord).select().single();
    if (error) throw error;
    return data;
  }

  const id = crypto.randomUUID();
  const created = {
    id,
    ...newRecord,
    created_at: new Date().toISOString(),
  };
  inMemoryStore.soil_records.set(id, created);
  return created;
};

// --- CROP RECOMMENDATIONS ---
export const saveCropRecommendation = async (farmerId, payload) => {
  const record = {
    farmer_id: farmerId,
    plot_id: payload.plot_id || null,
    season: payload.season || 'Kharif',
    input_snapshot: payload.input_snapshot,
    recommendations: payload.recommendations,
    ai_model: payload.ai_model || 'AgriPulse-ICAR-Model',
    source_metadata: payload.source_metadata || {},
  };

  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client.from('crop_recommendations').insert(record).select().single();
    if (error) throw error;
    return data;
  }

  const id = crypto.randomUUID();
  const created = { id, ...record, created_at: new Date().toISOString() };
  inMemoryStore.crop_recommendations.set(id, created);
  return created;
};

export const getCropRecommendations = async (farmerId, plotId = null) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    let query = client.from('crop_recommendations').select('*, plots(plot_name)').eq('farmer_id', farmerId);
    if (plotId) query = query.eq('plot_id', plotId);
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  return Array.from(inMemoryStore.crop_recommendations.values())
    .filter((r) => r.farmer_id === farmerId && (!plotId || r.plot_id === plotId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getCropRecommendationById = async (farmerId, id) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('crop_recommendations')
      .select('*, plots(plot_name)')
      .eq('id', id)
      .eq('farmer_id', farmerId)
      .single();
    if (error) return null;
    return data;
  }
  const r = inMemoryStore.crop_recommendations.get(id);
  return r && r.farmer_id === farmerId ? r : null;
};

// --- DISEASE DIAGNOSES ---
export const saveDiseaseDiagnosis = async (farmerId, payload) => {
  const record = {
    farmer_id: farmerId,
    plot_id: payload.plot_id || null,
    crop_name: payload.crop_name,
    image_path: payload.image_path || null,
    symptoms: payload.symptoms || null,
    diagnosis: payload.diagnosis,
    ai_model: payload.ai_model || 'AgriPulse-Vision-Model',
  };

  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client.from('disease_diagnoses').insert(record).select().single();
    if (error) throw error;
    return data;
  }

  const id = crypto.randomUUID();
  const created = { id, ...record, created_at: new Date().toISOString() };
  inMemoryStore.disease_diagnoses.set(id, created);
  return created;
};

export const getDiseaseHistory = async (farmerId) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('disease_diagnoses')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  return Array.from(inMemoryStore.disease_diagnoses.values())
    .filter((d) => d.farmer_id === farmerId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// --- FERTILIZER PLANS ---
export const saveFertilizerPlan = async (farmerId, payload) => {
  const record = {
    farmer_id: farmerId,
    plot_id: payload.plot_id || null,
    crop_name: payload.crop_name,
    growth_stage: payload.growth_stage,
    fertilizer_data: payload.fertilizer_data,
  };

  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client.from('fertilizer_plans').insert(record).select().single();
    if (error) throw error;
    return data;
  }

  const id = crypto.randomUUID();
  const created = { id, ...record, created_at: new Date().toISOString() };
  inMemoryStore.fertilizer_plans.set(id, created);
  return created;
};

export const getFertilizerHistory = async (farmerId) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('fertilizer_plans')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  return Array.from(inMemoryStore.fertilizer_plans.values())
    .filter((f) => f.farmer_id === farmerId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// --- CHAT SESSIONS & MESSAGES ---
export const getChatConversations = async (farmerId) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('chat_conversations')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  return Array.from(inMemoryStore.chat_conversations.values())
    .filter((c) => c.farmer_id === farmerId)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
};

export const getChatMessages = async (farmerId, conversationId) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  return Array.from(inMemoryStore.chat_messages.values())
    .filter((m) => m.conversation_id === conversationId && m.farmer_id === farmerId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

export const createChatConversation = async (farmerId, title = 'Agricultural Advisory Session', language = 'en') => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('chat_conversations')
      .insert({ farmer_id: farmerId, title, language })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const id = crypto.randomUUID();
  const created = {
    id,
    farmer_id: farmerId,
    title,
    language,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemoryStore.chat_conversations.set(id, created);
  return created;
};

export const addChatMessage = async (farmerId, conversationId, role, content, metadata = {}) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { data, error } = await client
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        farmer_id: farmerId,
        role,
        content,
        metadata,
      })
      .select()
      .single();
    if (error) throw error;

    // Update conversation updated_at
    await client
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  }

  const id = crypto.randomUUID();
  const created = {
    id,
    conversation_id: conversationId,
    farmer_id: farmerId,
    role,
    content,
    metadata,
    created_at: new Date().toISOString(),
  };
  inMemoryStore.chat_messages.set(id, created);

  const conv = inMemoryStore.chat_conversations.get(conversationId);
  if (conv) {
    conv.updated_at = new Date().toISOString();
  }

  return created;
};

export const deleteChatConversation = async (farmerId, conversationId) => {
  if (hasSupabaseConfig) {
    const client = getClient();
    const { error } = await client
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('farmer_id', farmerId);
    if (error) throw error;
    return true;
  }

  const conv = inMemoryStore.chat_conversations.get(conversationId);
  if (!conv || conv.farmer_id !== farmerId) return false;
  inMemoryStore.chat_conversations.delete(conversationId);
  for (const [mid, m] of inMemoryStore.chat_messages.entries()) {
    if (m.conversation_id === conversationId) {
      inMemoryStore.chat_messages.delete(mid);
    }
  }
  return true;
};
