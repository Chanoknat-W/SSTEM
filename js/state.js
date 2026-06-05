const State = {
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  load(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || null;
    } catch {
      return null;
    }
  },

  clearAll() {
    ['sst_info', 'sst_domain1', 'sst_domain2', 'sst_domain3', 'sst_reflection'].forEach(k =>
      localStorage.removeItem(k)
    );
  },

  getScore(domainKey) {
    const answers = this.load(domainKey);
    if (!answers) return 0;
    return Object.values(answers).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
  },

  getLevel(total) {
    if (total >= 60) return { label: 'ดีมาก', color: '#1B5E20', bg: '#E8F5E9' };
    if (total >= 46) return { label: 'ดี', color: '#2E7D32', bg: '#F1F8E9' };
    if (total >= 31) return { label: 'พอใช้', color: '#F57F17', bg: '#FFF8E1' };
    return { label: 'ปรับปรุง', color: '#B71C1C', bg: '#FFEBEE' };
  },
};
