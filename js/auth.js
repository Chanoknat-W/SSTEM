const SUPABASE_URL = 'https://otnrmfgquzjfidycehqo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wO5l7ypI7_u1tw8nt5ce-g_PMzAU-lM';

const Auth = {
  async login(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');

    localStorage.setItem('sst_token', data.access_token);
    localStorage.setItem('sst_refresh_token', data.refresh_token || '');

    const profile = await this._fetchProfile(data.access_token, data.user.id);
    const user = { id: data.user.id, email: data.user.email, ...profile };
    localStorage.setItem('sst_user', JSON.stringify(user));
    return user;
  },

  async register(email, password, displayName, role) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'สมัครสมาชิกไม่สำเร็จ');
    if (!data.access_token) throw new Error('กรุณาปิด "Enable email confirmations" ใน Supabase Dashboard ก่อน');

    const token = data.access_token;
    const userId = data.user.id;

    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ id: userId, display_name: displayName, role }),
    });
    if (!profileRes.ok) {
      const err = await profileRes.text();
      throw new Error('บันทึกโปรไฟล์ไม่สำเร็จ: ' + err);
    }

    localStorage.setItem('sst_token', token);
    localStorage.setItem('sst_refresh_token', data.refresh_token || '');
    const user = { id: userId, email, display_name: displayName, role };
    localStorage.setItem('sst_user', JSON.stringify(user));
    return user;
  },

  async _fetchProfile(token, userId) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      return data[0] || {};
    } catch { return {}; }
  },

  logout() {
    ['sst_token','sst_refresh_token','sst_user',
     'sst_info','sst_domain1','sst_domain2','sst_domain3','sst_eval_id']
      .forEach(k => localStorage.removeItem(k));
    window.location.href = 'login.html';
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem('sst_user')); }
    catch { return null; }
  },

  getToken() { return localStorage.getItem('sst_token') || ''; },

  requireAuth(requiredRole) {
    const user = this.getUser();
    const token = this.getToken();
    if (!user || !token) { window.location.href = 'login.html'; return null; }
    if (requiredRole && user.role !== requiredRole) {
      window.location.href = user.role === 'self' ? 'index.html' : 'eval-search.html';
      return null;
    }
    return user;
  },

  redirectByRole(user) {
    if (user.role === 'eval') window.location.href = 'eval-search.html';
    else window.location.href = 'index.html';
  },
};
