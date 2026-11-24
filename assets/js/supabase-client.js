// ================================================================
// الجحفلي للحلول الرقمية - Al-Jahfali Digital Solutions
// Supabase Cloud Database Client & Real-Time Sync
// ================================================================

(function(window) {
  'use strict';

  // Config object
  const Config = {
    getUrl: () => localStorage.getItem('aljahfali_supabase_url') || window.DEFAULT_SUPABASE_URL || '',
    getKey: () => localStorage.getItem('aljahfali_supabase_key') || window.DEFAULT_SUPABASE_KEY || '',
    isConfigured: function() {
      return !!(this.getUrl() && this.getKey());
    }
  };

  let clientInstance = null;

  function getClient() {
    if (!Config.isConfigured()) return null;
    if (clientInstance) return clientInstance;

    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        clientInstance = window.supabase.createClient(Config.getUrl(), Config.getKey());
        return clientInstance;
      } catch (e) {
        console.error('Failed to init Supabase client:', e);
        return null;
      }
    }
    return null;
  }

  // Cloud API Methods
  const CloudDB = {
    config: Config,

    // Test cloud connection
    async testConnection() {
      const client = getClient();
      if (!client) throw new Error('بيانات الربط بالسحابة (URL / Key) غير مكتملة');
      const { data, error } = await client.from('store_settings').select('*').limit(1);
      if (error) throw error;
      return true;
    },

    // Fetch all products from Cloud (fallback to local if error/not configured)
    async fetchProducts() {
      const client = getClient();
      if (!client) {
        return window.PRODUCTS_CATALOG || [];
      }

      try {
        const { data, error } = await client
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('title', { ascending: true });

        if (error || !data || data.length === 0) {
          console.warn('Supabase products fetch failed or empty, using local fallback:', error);
          return window.PRODUCTS_CATALOG || [];
        }

        console.log(`Loaded ${data.length} products live from Supabase Cloud!`);
        return data;
      } catch (e) {
        console.warn('Network error fetching from Supabase, using local catalog:', e);
        return window.PRODUCTS_CATALOG || [];
      }
    },

    // Fetch exchange rates from Cloud
    async fetchRates() {
      const client = getClient();
      if (!client) {
        return JSON.parse(localStorage.getItem('aljahfali_rates') || '{"sanaa": 536, "sar": 140, "aden": 2000}');
      }

      try {
        const { data, error } = await client
          .from('store_settings')
          .select('value')
          .eq('key', 'exchange_rates')
          .single();

        if (error || !data) {
          return JSON.parse(localStorage.getItem('aljahfali_rates') || '{"sanaa": 536, "sar": 140, "aden": 2000}');
        }
        return data.value;
      } catch (e) {
        return JSON.parse(localStorage.getItem('aljahfali_rates') || '{"sanaa": 536, "sar": 140, "aden": 2000}');
      }
    },

    // Update product price & stock in Cloud
    async updateProduct(pid, updates) {
      const client = getClient();
      if (!client) {
        throw new Error('السحابة غير مفعلة، تم الحفظ محلياً فقط');
      }

      updates.updated_at = new Date().toISOString();
      const { data, error } = await client
        .from('products')
        .update(updates)
        .eq('id', pid);

      if (error) throw error;
      return data;
    },

    // Update exchange rates in Cloud
    async updateRates(newRates) {
      const client = getClient();
      if (!client) {
        localStorage.setItem('aljahfali_rates', JSON.stringify(newRates));
        return;
      }

      const { data, error } = await client
        .from('store_settings')
        .upsert({
          key: 'exchange_rates',
          value: newRates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      localStorage.setItem('aljahfali_rates', JSON.stringify(newRates));
      return data;
    },

    // Save customer order into Cloud orders table
    async saveOrder(orderRecord) {
      const client = getClient();
      if (!client) return null; // WhatsApp handles order even if cloud is offline

      try {
        const { data, error } = await client
          .from('orders')
          .insert([orderRecord]);

        if (error) console.warn('Could not save order to Supabase:', error);
        return data;
      } catch (e) {
        console.warn('Network error saving order to Supabase:', e);
        return null;
      }
    },

    // One-Click Migration: Upload all 610 products into Supabase
    async migrateAllProducts(onProgress) {
      const client = getClient();
      if (!client) throw new Error('يرجى إدخال رابط ومفتاح Supabase أولاً');

      const catalog = window.PRODUCTS_CATALOG || [];
      const total = catalog.length;
      if (total === 0) throw new Error('لا توجد منتجات لرفعها');

      const BATCH_SIZE = 50;
      let uploaded = 0;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = catalog.slice(i, i + BATCH_SIZE).map(p => ({
          id: p.id,
          raw_name: p.raw_name,
          title: p.title,
          service_key: p.service_key,
          service_name: p.service_name,
          category: p.category,
          brand_color: p.brand_color,
          brand_gradient: p.brand_gradient,
          brand_label: p.brand_label,
          icon: p.icon,
          is_guaranteed: p.is_guaranteed,
          warranty_text: p.warranty_text,
          warranty_policy: p.warranty_policy,
          duration: p.duration,
          stock: p.stock,
          sold: p.sold,
          in_stock: p.in_stock,
          prices: p.prices,
          card_desc: p.card_desc,
          modal_data: p.modal_data,
          is_active: true
        }));

        const { error } = await client.from('products').upsert(batch, { onConflict: 'id' });
        if (error) throw error;

        uploaded += batch.length;
        if (typeof onProgress === 'function') {
          onProgress(uploaded, total);
        }
      }

      return uploaded;
    }
  };

  window.AlJahfaliCloud = CloudDB;
})(window);
