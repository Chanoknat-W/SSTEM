const SupabaseClient = {
  async _fetch(url, options) {
    let res = await fetch(url, options);
    if (res.status === 401 || res.status === 403) {
      const text = await res.text();
      if (text.includes('expired') || text.includes('JWT') || text.includes('exp') || text.includes('Unauthorized')) {
        const ok = await Auth.refreshToken();
        if (ok) {
          const newOpts = { ...options, headers: { ...options.headers, Authorization: `Bearer ${Auth.getToken()}` } };
          const retryRes = await fetch(url, newOpts);
          if (retryRes.ok) return retryRes;
        }
        Auth.logout();
        throw new Error('__SESSION_EXPIRED__');
      }
      return new Response(text, { status: res.status, statusText: res.statusText });
    }
    return res;
  },

  _headers(token) {
    return {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || Auth.getToken()}`,
    };
  },

  // Generic PATCH for an evaluation record
  async updateEvaluation(evalId, data) {
    const patch = { ...data };
    if (patch.eval_status === 'pending') patch.submitted_at = new Date().toISOString();
    const res = await this._fetch(`${SUPABASE_URL}/rest/v1/evaluations?id=eq.${evalId}`, {
      method: 'PATCH',
      headers: { ...this._headers(), Prefer: 'return=minimal' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  // Save evaluation — returns evaluation id
  // status: 'draft' | 'pending'
  async saveEvaluation(filesJson, status = 'draft') {
    const token = Auth.getToken();
    const user  = Auth.getUser();
    const info  = (typeof State !== 'undefined' ? State.load('sst_info') : null) || {};
    const d1    = (typeof State !== 'undefined' ? State.load('sst_domain1') : null) || {};
    const d2    = (typeof State !== 'undefined' ? State.load('sst_domain2') : null) || {};
    const d3    = (typeof State !== 'undefined' ? State.load('sst_domain3') : null) || {};

    const d1Total = Object.values(d1).reduce((s, v) => s + (parseInt(v) || 0), 0);
    const d2Total = Object.values(d2).reduce((s, v) => s + (parseInt(v) || 0), 0);
    const d3Total = Object.values(d3).reduce((s, v) => s + (parseInt(v) || 0), 0);
    const total   = d1Total + d2Total + d3Total;

    const levelMap = (t) => t >= 60 ? 'ดีมาก' : t >= 46 ? 'ดี' : t >= 31 ? 'พอใช้' : 'ปรับปรุง';

    const payload = {
      user_id: user?.id,
      teacher_name:    info.teacher_name,
      school:          info.school,
      semester:        info.semester,
      grade:           info.grade,
      district:        info.district,
      domain1_answers: d1,
      domain2_answers: d2,
      domain3_answers: d3,
      domain1_total:   d1Total,
      domain2_total:   d2Total,
      domain3_total:   d3Total,
      total_score:     total,
      level:           levelMap(total),
      files:           filesJson || {},
      eval_status:     status,
      ...(status === 'pending' ? { submitted_at: new Date().toISOString() } : {}),
    };

    const res = await this._fetch(`${SUPABASE_URL}/rest/v1/evaluations`, {
      method: 'POST',
      headers: { ...this._headers(token), Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const rows = await res.json();
    return rows[0]?.id;
  },

  // Update evaluation status: draft → pending
  async submitEvaluation(evalId) {
    const res = await this._fetch(`${SUPABASE_URL}/rest/v1/evaluations?id=eq.${evalId}`, {
      method: 'PATCH',
      headers: { ...this._headers(), Prefer: 'return=minimal' },
      body: JSON.stringify({ eval_status: 'pending' }),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  // Get teacher's own evaluations
  async getMyEvaluations() {
    const user = Auth.getUser();
    const res  = await this._fetch(
      `${SUPABASE_URL}/rest/v1/evaluations?user_id=eq.${user.id}&order=created_at.desc&select=*`,
      { headers: this._headers() }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Get a single evaluation by id
  async getEvaluation(evalId) {
    const res = await this._fetch(
      `${SUPABASE_URL}/rest/v1/evaluations?id=eq.${evalId}&select=*`,
      { headers: this._headers() }
    );
    if (!res.ok) throw new Error(await res.text());
    const rows = await res.json();
    return rows[0] || null;
  },

  // Get all pending/evaluated evaluations (for evaluators) — exclude own submissions
  async getPendingEvaluations(search) {
    const user = Auth.getUser();
    let url = `${SUPABASE_URL}/rest/v1/evaluations?eval_status=in.(pending,evaluated)&order=created_at.desc&select=*`;
    if (user) url += `&user_id=neq.${user.id}`;
    if (search) {
      const q = encodeURIComponent(`%${search}%`);
      url += `&or=(teacher_name.ilike.${q},school.ilike.${q})`;
    }
    const res = await this._fetch(url, { headers: this._headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Save evaluator's scores (scores = {domain1:{...answers}, domain2:{...}, domain3:{...}})
  async saveEvalScore(evalId, scores, suggestions) {

    const evalInfo = JSON.parse(
      localStorage.getItem('sst_eval_info') || '{}'
    );

    const user  = Auth.getUser();
    const d1    = Object.values(scores.domain1||{}).reduce((s,v)=>s+(parseInt(v)||0),0);
    const d2    = Object.values(scores.domain2||{}).reduce((s,v)=>s+(parseInt(v)||0),0);
    const d3    = Object.values(scores.domain3||{}).reduce((s,v)=>s+(parseInt(v)||0),0);
    const total = d1+d2+d3;
    const level = total >= 60 ? 'ดีมาก' : total >= 46 ? 'ดี' : total >= 31 ? 'พอใช้' : 'ควรปรับปรุง';
    const res   = await this._fetch(`${SUPABASE_URL}/rest/v1/evaluations?id=eq.${evalId}`, {
      method: 'PATCH',
      headers: { ...this._headers(), Prefer: 'return=representation' },
      body: JSON.stringify({
        eval_scores:      scores,
        eval_suggestions: suggestions,
        eval_by:          user?.id,
        eval_by_name:     evalInfo.name,
        eval_status:      'evaluated',
        evaluated_at:     new Date().toISOString(),
        domain1_total:    d1,
        domain2_total:    d2,
        domain3_total:    d3,
        total_score:      total,
        level:            level,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const rows = await res.json();
    if (!rows.length) throw new Error('บันทึกไม่สำเร็จ: ไม่มีสิทธิ์อัปเดตข้อมูลนี้ (กรุณาตรวจสอบ RLS policy ใน Supabase)');
  },

  // Upload file to Supabase Storage, returns public URL
  async uploadFile(file, path) {
    const token = Auth.getToken();
    const res   = await fetch(
      `${SUPABASE_URL}/storage/v1/object/evaluation-docs/${path}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: file,
      }
    );
    if (!res.ok) throw new Error(await res.text());
    return `${SUPABASE_URL}/storage/v1/object/public/evaluation-docs/${path}`;
  },
};
