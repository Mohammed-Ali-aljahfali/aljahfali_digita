import re

def update_subscriptions():
    with open('subscriptions.html', encoding='utf-8') as f:
        text = f.read()

    # 1. Add Supabase scripts
    old_scripts = r'''  <!-- LOAD PRODUCTS CATALOG DATA -->
  <script src="assets/data/products.js"></script>'''

    new_scripts = r'''  <!-- SUPABASE & DATA SCRIPTS -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="assets/data/products.js"></script>
  <script src="assets/js/supabase-client.js"></script>'''

    if old_scripts in text:
        text = text.replace(old_scripts, new_scripts)

    # 2. Update DOMContentLoaded for background cloud fetch
    old_init = r'''    // ── INIT ──
    document.addEventListener('DOMContentLoaded', () => {
      const storedCatalog = localStorage.getItem('aljahfali_catalog_custom');
      if (storedCatalog) {
        try {
          allProducts = JSON.parse(storedCatalog);
        } catch(e) {
          allProducts = window.PRODUCTS_CATALOG || [];
        }
      } else if (window.PRODUCTS_CATALOG && Array.isArray(window.PRODUCTS_CATALOG)) {
        allProducts = window.PRODUCTS_CATALOG;
      } else {
        allProducts = [];
      }

      updateCartBadge();
      initEventListeners();
      applyFilters();
    });'''

    new_init = r'''    // ── INIT ──
    document.addEventListener('DOMContentLoaded', async () => {
      const storedCatalog = localStorage.getItem('aljahfali_catalog_custom');
      if (storedCatalog) {
        try {
          allProducts = JSON.parse(storedCatalog);
        } catch(e) {
          allProducts = window.PRODUCTS_CATALOG || [];
        }
      } else if (window.PRODUCTS_CATALOG && Array.isArray(window.PRODUCTS_CATALOG)) {
        allProducts = window.PRODUCTS_CATALOG;
      } else {
        allProducts = [];
      }

      updateCartBadge();
      initEventListeners();
      applyFilters();

      // Background Real-Time Cloud Sync (Supabase)
      if (window.AlJahfaliCloud && window.AlJahfaliCloud.config.isConfigured()) {
        try {
          const cloudProducts = await window.AlJahfaliCloud.fetchProducts();
          if (cloudProducts && cloudProducts.length > 0) {
            allProducts = cloudProducts;
            applyFilters();
          }
          const cloudRates = await window.AlJahfaliCloud.fetchRates();
          if (cloudRates) {
            const statNums = document.querySelectorAll('.store-stats-row .stat-pill .num');
            if (cloudRates.sanaa && statNums[2]) statNums[2].textContent = `${cloudRates.sanaa} ر.ي`;
            if (cloudRates.sar && statNums[3]) statNums[3].textContent = `${cloudRates.sar} ر.ي`;
          }
        } catch (e) {
          console.log('Loaded from local catalog');
        }
      }
    });'''

    if old_init in text:
        text = text.replace(old_init, new_init)

    # 3. Save order to Supabase inside submitOrderToWhatsapp
    old_order = r'''      const waUrl = `https://wa.me/967782611415?text=${encodeURIComponent(invoiceMsg)}`;
      window.open(waUrl, '_blank');
      closeCheckoutModal();'''

    new_order = r'''      // Record order into Cloud Database if configured
      if (window.AlJahfaliCloud && window.AlJahfaliCloud.config.isConfigured()) {
        window.AlJahfaliCloud.saveOrder({
          id: 'ORD-' + Date.now(),
          customer_name: name,
          customer_phone: phone || '',
          items: cart,
          total_usd: totalUsd,
          total_sar: totalSar,
          total_yer_sanaa: totalYerSanaa,
          total_yer_aden: totalYerAden,
          payment_method: method,
          status: 'pending'
        });
      }

      const waUrl = `https://wa.me/967782611415?text=${encodeURIComponent(invoiceMsg)}`;
      window.open(waUrl, '_blank');
      closeCheckoutModal();'''

    if old_order in text:
        text = text.replace(old_order, new_order)

    with open('subscriptions.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Updated subscriptions.html with Supabase live sync!")

def update_admin():
    with open('admin.html', encoding='utf-8') as f:
        text = f.read()

    # 1. Add Supabase scripts
    old_scripts = r'''  <script src="assets/data/products.js"></script>'''
    new_scripts = r'''  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="assets/data/products.js"></script>
  <script src="assets/js/supabase-client.js"></script>'''

    if old_scripts in text:
        text = text.replace(old_scripts, new_scripts)

    # 2. Add Cloud Settings Card before exchange rates
    cloud_box = r'''    <!-- CLOUD DATABASE (SUPABASE) SETTINGS -->
    <div class="config-box" style="border: 1px solid #0284C7; background: #F0F9FF;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <h3 style="margin: 0; color: #0284C7;">
          <svg class="ui-svg" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
          <span>الربط مع قاعدة البيانات السحابية (Supabase Cloud Database)</span>
        </h3>
        <span id="cloudStatusBadge" style="padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 800; background: #E2E8F0; color: #64748B;">
          غير متصل بالسحابة حالياً
        </span>
      </div>
      
      <p style="font-size: 13px; color: #475569; margin: 0 0 14px; line-height: 1.5;">
        عند ربط قاعدة البيانات السحابية، أي سعر تعدله هنا من جوالك أو كمبيوترك يتغير فوراً وبنفس الثانية عند جميع الزوار في العالم بدون الحاجة لأي رفع ملفات!
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div class="field-group">
          <label>رابط مشروع Supabase (Project URL)</label>
          <input type="text" id="supabaseUrlInput" placeholder="مثال: https://xyzcompany.supabase.co">
        </div>
        <div class="field-group">
          <label>مفتاح الوصول السحابي (Anon Public Key)</label>
          <input type="password" id="supabaseKeyInput" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
        </div>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
        <button class="btn-action btn-primary" onclick="saveCloudKeys()">
          <svg class="ui-svg" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span>حفظ وتفعيل مفاتيح السحابة</span>
        </button>
        <button class="btn-action btn-secondary" onclick="testCloudConnection()">
          <svg class="ui-svg" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span>فحص الاتصال بالسحابة</span>
        </button>
        <button class="btn-action btn-accent" id="btnMigrate" onclick="migrateProductsToCloud()">
          <svg class="ui-svg" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>
          <span>رفع الـ 610 منتجات بالكامل إلى السحابة بنقرة واحدة (Migrate)</span>
        </button>
      </div>
      <div id="migrationProgressBar" style="display: none; margin-top: 12px; background: #E2E8F0; border-radius: 999px; height: 10px; overflow: hidden;">
        <div id="migrationProgressFill" style="background: #10B981; height: 100%; width: 0%; transition: width 0.2s;"></div>
      </div>
    </div>

'''

    old_rates_box = r'''    <!-- EXCHANGE RATES SETTINGS -->'''
    if old_rates_box in text and 'الربط مع قاعدة البيانات السحابية' not in text:
        text = text.replace(old_rates_box, cloud_box + old_rates_box)

    # 3. Add Cloud JS logic in admin script
    cloud_admin_js = r'''
    // ── CLOUD SUPABASE INTEGRATION ──
    function initCloudStatus() {
      const url = localStorage.getItem('aljahfali_supabase_url') || '';
      const key = localStorage.getItem('aljahfali_supabase_key') || '';
      document.getElementById('supabaseUrlInput').value = url;
      document.getElementById('supabaseKeyInput').value = key;

      const badge = document.getElementById('cloudStatusBadge');
      if (url && key) {
        badge.style.background = '#ECFDF5';
        badge.style.color = '#059669';
        badge.textContent = 'السحابة متصلة ومفعلة';
      } else {
        badge.style.background = '#E2E8F0';
        badge.style.color = '#64748B';
        badge.textContent = 'غير متصل بالسحابة حالياً';
      }
    }

    async function saveCloudKeys() {
      const url = document.getElementById('supabaseUrlInput').value.trim();
      const key = document.getElementById('supabaseKeyInput').value.trim();

      if (!url || !key) {
        alert('يرجى إدخال الرابط والمفتاح معاً');
        return;
      }

      localStorage.setItem('aljahfali_supabase_url', url);
      localStorage.setItem('aljahfali_supabase_key', key);
      initCloudStatus();
      showToast('تم حفظ مفاتيح السحابة بنجاح!');
      await testCloudConnection();
    }

    async function testCloudConnection() {
      try {
        await window.AlJahfaliCloud.testConnection();
        alert('تم الاتصال بقاعدة بيانات Supabase السحابية بنجاح 100%!');
      } catch (e) {
        alert('تعذر الاتصال بالسحابة: ' + (e.message || e));
      }
    }

    async function migrateProductsToCloud() {
      const btn = document.getElementById('btnMigrate');
      const bar = document.getElementById('migrationProgressBar');
      const fill = document.getElementById('migrationProgressFill');

      if (!confirm('هل تريد رفع وتحديث كافة الـ 610 منتجات على قاعدة بيانات Supabase السحابية؟')) {
        return;
      }

      btn.disabled = true;
      bar.style.display = 'block';

      try {
        const count = await window.AlJahfaliCloud.migrateAllProducts((done, total) => {
          const pct = Math.round((done / total) * 100);
          fill.style.width = pct + '%';
          btn.textContent = `جاري رفع المنتجات للسحابة (${done}/${total})...`;
        });

        alert(`اكتمل الرفع بنجاح! تم نقل ${count} منتج إلى قاعدة بيانات Supabase السحابية.`);
        btn.textContent = 'تم رفع كافة المنتجات بنجاح!';
      } catch (e) {
        alert('حدث خطأ أثناء الرفع: ' + (e.message || e));
        btn.textContent = 'إعادة محاولة الرفع';
      } finally {
        btn.disabled = false;
      }
    }
'''

    if 'function initCloudStatus()' not in text:
        text = text.replace('document.addEventListener(\'DOMContentLoaded\', () => {', 'document.addEventListener(\'DOMContentLoaded\', () => {\n      initCloudStatus();')
        text = text.replace('function applyExchangeRates() {', cloud_admin_js + '\n    function applyExchangeRates() {')

    # Also update updateProductPrice & applyExchangeRates to update Cloud
    old_update_price = r'''      p.prices.yer_aden = Math.round(usd * exchangeRates.aden);
      saveCatalogLocally();
      showToast(`تم تحديث سعر "${p.title}" إلى $${usd}`);'''

    new_update_price = r'''      p.prices.yer_aden = Math.round(usd * exchangeRates.aden);
      saveCatalogLocally();
      if (window.AlJahfaliCloud && window.AlJahfaliCloud.config.isConfigured()) {
        window.AlJahfaliCloud.updateProduct(p.id, { prices: p.prices });
      }
      showToast(`تم تحديث سعر "${p.title}" إلى $${usd}`);'''

    if old_update_price in text:
        text = text.replace(old_update_price, new_update_price)

    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Updated admin.html with Supabase manager and migration!")

if __name__ == '__main__':
    update_subscriptions()
    update_admin()
