// Supabase configuration
// ใส่ค่าจาก Supabase Dashboard > Settings > API
const SUPABASE_URL = 'https://otnrmfgquzjfidycehqo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wO5l7ypI7_u1tw8nt5ce-g_PMzAU-lM';

const SupabaseClient = {
  async saveEvaluation() {
    if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
      console.warn('Supabase not configured — skipping save');
      return;
    }

    const info = State.load('sst_info') || {};
    const d1 = State.load('sst_domain1') || {};
    const d2 = State.load('sst_domain2') || {};
    const d3 = State.load('sst_domain3') || {};
    const reflection = State.load('sst_reflection') || {};

    const d1Total = Object.values(d1).reduce((s, v) => s + (parseInt(v) || 0), 0);
    const d2Total = Object.values(d2).reduce((s, v) => s + (parseInt(v) || 0), 0);
    const d3Total = Object.values(d3).reduce((s, v) => s + (parseInt(v) || 0), 0);
    const total = d1Total + d2Total + d3Total;
    const level = State.getLevel(total).label;

    const payload = {
      teacher_name: info.teacher_name,
      school: info.school,
      semester: info.semester,
      domain1_answers: d1,
      domain2_answers: d2,
      domain3_answers: d3,
      domain1_total: d1Total,
      domain2_total: d2Total,
      domain3_total: d3Total,
      total_score: total,
      level,
      reflection,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/evaluations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase error: ${err}`);
    }
  },
};
