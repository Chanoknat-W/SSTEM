// ============================================
// แก้ไข credentials ของผู้บริหารตรงนี้
const ADMIN_USERNAME    = 'admin';
const ADMIN_PASSWORD    = 'admin1234';
// Supabase account สำหรับดึงข้อมูล — สร้างผ่าน Supabase Dashboard แล้วใส่ค่าตรงนี้
const ADMIN_SB_EMAIL    = 'admin@sstem.local';
const ADMIN_SB_PASSWORD = 'SSTem@admin2567';
// ============================================

const AdminAuth = {
  async login(username, password) {
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ email: ADMIN_SB_EMAIL, password: ADMIN_SB_PASSWORD }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      sessionStorage.setItem('sst_admin_token', data.access_token);
      sessionStorage.setItem('sst_admin', JSON.stringify({ username, loggedIn: true }));
      return true;
    } catch { return false; }
  },

  getToken() {
    return sessionStorage.getItem('sst_admin_token');
  },

  requireAuth() {
    const session = sessionStorage.getItem('sst_admin');
    const token   = sessionStorage.getItem('sst_admin_token');
    if (!session || !token) { window.location.href = 'admin-login.html'; return false; }
    try { return JSON.parse(session).loggedIn === true; }
    catch { window.location.href = 'admin-login.html'; return false; }
  },

  getUsername() {
    try { return JSON.parse(sessionStorage.getItem('sst_admin') || '{}').username || ''; }
    catch { return ''; }
  },

  logout() {
    sessionStorage.removeItem('sst_admin_token');
    sessionStorage.removeItem('sst_admin');
    window.location.href = 'admin-login.html';
  },
};
