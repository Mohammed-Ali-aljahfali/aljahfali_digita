// ==============================================================================
// الجحفلي للحلول الرقمية - Al-Jahfali Digital Solutions
// Supabase Cloud Database Client, User Auth & Orders Management
// 100% Zero-Emoji, Production-Grade, Resilient Fallbacks
// ==============================================================================

(function(window) {
  'use strict';

  // Configuration Manager
  const Config = {
    getUrl: () => localStorage.getItem('aljahfali_supabase_url') || window.DEFAULT_SUPABASE_URL || '',
    getKey: () => localStorage.getItem('aljahfali_supabase_key') || window.DEFAULT_SUPABASE_KEY || '',
    setCredentials: function(url, key) {
      if (url) localStorage.setItem('aljahfali_supabase_url', url.trim());
      if (key) localStorage.setItem('aljahfali_supabase_key', key.trim());
      clientInstance = null; // Reset cached instance
    },
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
        clientInstance = window.supabase.createClient(Config.getUrl(), Config.getKey(), {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        return clientInstance;
      } catch (e) {
        console.error('Failed to init Supabase client:', e);
        return null;
      }
    }
    return null;
  }

  // Cloud & Local Hybrid Database
  const CloudDB = {
    config: Config,

    // Test connection
    async testConnection() {
      const client = getClient();
      if (!client) throw new Error('بيانات الربط بالسحابة (URL / Key) غير مكتملة');
      const { data, error } = await client.from('store_settings').select('*').limit(1);
      if (error) throw error;
      return true;
    },

    // ──────────────────────────────────────────────
    // Products Management
    // ──────────────────────────────────────────────

    // Fetch active products
    async fetchProducts() {
      const client = getClient();
      if (!client) {
        return this.getLocalProducts();
      }

      try {
        const { data, error } = await client
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: true });

        if (error || !data || data.length === 0) {
          console.warn('Supabase fetch failed or empty, falling back to curated local catalog:', error);
          return this.getLocalProducts();
        }

        console.log(`Loaded ${data.length} products live from Supabase Cloud!`);
        return data;
      } catch (e) {
        console.warn('Network error fetching from Supabase, using local catalog:', e);
        return this.getLocalProducts();
      }
    },

    // Local products fallback
    getLocalProducts() {
      const stored = localStorage.getItem('aljahfali_custom_products');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
      return window.PRODUCTS_CATALOG || [];
    },

    // Add new product
    async addProduct(productData) {
      if (!productData.id) {
        productData.id = 'prod_' + Date.now();
      }
      productData.is_active = true;
      productData.created_at = new Date().toISOString();
      productData.updated_at = new Date().toISOString();

      const client = getClient();
      if (client) {
        const { data, error } = await client.from('products').insert([productData]);
        if (error) throw error;
      }

      // Update local storage backup
      const products = this.getLocalProducts();
      products.unshift(productData);
      localStorage.setItem('aljahfali_custom_products', JSON.stringify(products));
      return productData;
    },

    // Update existing product
    async updateProduct(pid, updates) {
      updates.updated_at = new Date().toISOString();

      const client = getClient();
      if (client) {
        const { data, error } = await client
          .from('products')
          .update(updates)
          .eq('id', pid);
        if (error) throw error;
      }

      // Update local backup
      const products = this.getLocalProducts();
      const idx = products.findIndex(p => p.id === pid);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...updates };
        localStorage.setItem('aljahfali_custom_products', JSON.stringify(products));
      }
      return true;
    },

    // Delete product
    async deleteProduct(pid) {
      const client = getClient();
      if (client) {
        const { error } = await client
          .from('products')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', pid);
        if (error) throw error;
      }

      // Update local backup
      let products = this.getLocalProducts();
      products = products.filter(p => p.id !== pid);
      localStorage.setItem('aljahfali_custom_products', JSON.stringify(products));
      return true;
    },

    // ──────────────────────────────────────────────
    // Store Settings & Exchange Rates
    // ──────────────────────────────────────────────

    async fetchRates() {
      const defaultRates = { sanaa: 536, sar: 140, aden: 2000 };
      const client = getClient();
      if (!client) {
        return JSON.parse(localStorage.getItem('aljahfali_rates') || JSON.stringify(defaultRates));
      }

      try {
        const { data, error } = await client
          .from('store_settings')
          .select('value')
          .eq('key', 'exchange_rates')
          .single();

        if (error || !data) {
          return JSON.parse(localStorage.getItem('aljahfali_rates') || JSON.stringify(defaultRates));
        }
        return data.value;
      } catch (e) {
        return JSON.parse(localStorage.getItem('aljahfali_rates') || JSON.stringify(defaultRates));
      }
    },

    async updateRates(newRates) {
      const client = getClient();
      if (client) {
        const { error } = await client
          .from('store_settings')
          .upsert({
            key: 'exchange_rates',
            value: newRates,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
      }
      localStorage.setItem('aljahfali_rates', JSON.stringify(newRates));
      return true;
    },

    // ──────────────────────────────────────────────
    // User Authentication & Management
    // ──────────────────────────────────────────────

    // Sign up with Email and Password
    async signUp(email, password, fullName, phone) {
      const client = getClient();
      if (!client) throw new Error('يرجى تهيئة رابط ومفتاح Supabase أولاً لتفعيل تسجيل المستخدمين');

      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone ? phone.trim() : ''
          }
        }
      });

      if (error) throw error;
      return data;
    },

    // Sign in with Email and Password
    async signIn(email, password) {
      const client = getClient();
      if (!client) throw new Error('يرجى تهيئة رابط ومفتاح Supabase أولاً لتسجيل الدخول');

      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) throw error;
      return data;
    },

    // Sign in with Google OAuth
    async signInWithGoogle() {
      const client = getClient();
      if (!client) throw new Error('يرجى تهيئة رابط ومفتاح Supabase أولاً لتسجيل الدخول عبر Google');

      const returnUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/account.html');
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: returnUrl
        }
      });

      if (error) throw error;
      return data;
    },

    // Sign out
    async signOut() {
      const client = getClient();
      if (client) {
        await client.auth.signOut();
      }
      localStorage.removeItem('aljahfali_current_user');
      return true;
    },

    // Get current logged-in user
    async getCurrentUser() {
      const client = getClient();
      if (!client) return null;

      try {
        const { data: { user } } = await client.auth.getUser();
        if (user) {
          localStorage.setItem('aljahfali_current_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('aljahfali_current_user');
        }
        return user;
      } catch (e) {
        return null;
      }
    },

    // Get current user profile
    async getCurrentProfile(userId) {
      const client = getClient();
      if (!client || !userId) return null;

      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) return null;
        return data;
      } catch (e) {
        return null;
      }
    },

    // Subscribe to auth changes
    onAuthStateChange(callback) {
      const client = getClient();
      if (!client) return null;
      return client.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
    },

    // Get all user profiles (Admin)
    async getAllProfiles() {
      const client = getClient();
      if (!client) return [];

      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (e) {
        console.error('Failed to fetch user profiles:', e);
        return [];
      }
    },

    // ──────────────────────────────────────────────
    // Orders Management
    // ──────────────────────────────────────────────

    // Save order
    async saveOrder(orderRecord) {
      if (!orderRecord.id) {
        orderRecord.id = 'ORD-' + Date.now().toString(36).toUpperCase();
      }
      orderRecord.created_at = new Date().toISOString();
      orderRecord.status = orderRecord.status || 'pending';

      // Attach user ID if logged in
      const user = await this.getCurrentUser();
      if (user && !orderRecord.user_id) {
        orderRecord.user_id = user.id;
        if (!orderRecord.customer_email) {
          orderRecord.customer_email = user.email;
        }
      }

      // 1. Save to Supabase Cloud
      const client = getClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('orders')
            .insert([orderRecord]);

          if (error) console.warn('Supabase insert order error:', error);
        } catch (e) {
          console.warn('Network error inserting order to Supabase:', e);
        }
      }

      // 2. Always persist locally as resilient backup
      try {
        const localOrders = JSON.parse(localStorage.getItem('aljahfali_orders') || '[]');
        localOrders.unshift(orderRecord);
        localStorage.setItem('aljahfali_orders', JSON.stringify(localOrders));
      } catch (e) {}

      return orderRecord;
    },

    // Get customer's own orders
    async getUserOrders(userId) {
      const client = getClient();
      if (client && userId) {
        try {
          const { data, error } = await client
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) return data;
        } catch (e) {}
      }

      // Local fallback
      const localOrders = JSON.parse(localStorage.getItem('aljahfali_orders') || '[]');
      if (userId) {
        return localOrders.filter(o => o.user_id === userId);
      }
      return localOrders;
    },

    // Get all orders (Admin)
    async getAllOrders() {
      const client = getClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) return data;
        } catch (e) {}
      }

      return JSON.parse(localStorage.getItem('aljahfali_orders') || '[]');
    },

    // Update order status & delivery details (Admin)
    async updateOrderStatus(orderId, status, deliveryDetails) {
      const client = getClient();
      if (client) {
        const { error } = await client
          .from('orders')
          .update({
            status: status,
            delivery_details: deliveryDetails || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (error) throw error;
      }

      // Update local storage
      const localOrders = JSON.parse(localStorage.getItem('aljahfali_orders') || '[]');
      const target = localOrders.find(o => o.id === orderId);
      if (target) {
        target.status = status;
        if (deliveryDetails !== undefined) target.delivery_details = deliveryDetails;
        target.updated_at = new Date().toISOString();
        localStorage.setItem('aljahfali_orders', JSON.stringify(localOrders));
      }
      return true;
    },

    // ──────────────────────────────────────────────
    // One-Click Migration to Supabase
    // ──────────────────────────────────────────────
    async migrateAllProducts(onProgress) {
      const client = getClient();
      if (!client) throw new Error('يرجى إدخال رابط ومفتاح Supabase أولاً');

      const catalog = window.PRODUCTS_CATALOG || [];
      const total = catalog.length;
      if (total === 0) throw new Error('لا توجد منتجات لرفعها');

      const BATCH_SIZE = 25;
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
