/* Public runtime configuration. Only a Supabase publishable/anon key belongs here.
 * Never place service_role, database passwords, SMTP or WhatsApp tokens in this file.
 * Set these values for the deployed site after testing the SQL migrations in staging.
 */
window.ALJAHFALI_CONFIG = Object.freeze({
  supabaseUrl: 'https://rwvlgsqxmpeiucouxerz.supabase.co',
  supabasePublishableKey: '',
  auth: { googleEnabled: false },
  assistant: { enabled: true, timeoutMs: 25000 },
  requestTimeoutMs: 12000,
  supportPhone: '967782611415'
});
