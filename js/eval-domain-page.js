// Shared logic for eval-domain1/2/3.html (evaluator answers questions about teacher)
(function () {
  const domainKey = document.body.dataset.domain;
  const nextPage  = document.body.dataset.next;
  const evalStorageKey = 'sst_eval_' + domainKey; // e.g. sst_eval_domain1

  const domain = QUESTIONS[domainKey];
  if (!domain) return;

  // Redirect if no eval target
  const evalTargetId = localStorage.getItem('sst_eval_target_id');
  if (!evalTargetId) { window.location.href = 'eval-search.html'; return; }

  // Render title
  document.getElementById('domain-title').textContent = domain.title;
  document.getElementById('domain-subtitle').textContent = domain.subtitle;

  // Load saved answers
  const saved = JSON.parse(localStorage.getItem(evalStorageKey) || '{}');

  // Render questions
  const container = document.getElementById('questions-container');
  domain.questions.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `card-${q.id}`;

    const choicesHtml = q.choices.map(c => `
      <label class="choice ${saved[q.id] == c.score ? 'selected' : ''}" data-qid="${q.id}" data-score="${c.score}">
        <input type="radio" name="${q.id}" value="${c.score}" ${saved[q.id] == c.score ? 'checked' : ''} />
        <div class="choice-indicator"></div>
        <span class="choice-score">${c.score} คะแนน</span>
        <span class="choice-text">${c.text}</span>
      </label>`).join('');

    card.innerHTML = `
      <div class="question-number">ข้อที่ ${i + 1} จาก ${domain.questions.length}</div>
      <div class="question-text">${q.text}</div>
      <div class="choices">${choicesHtml}</div>`;
    container.appendChild(card);
  });

  container.addEventListener('click', e => {
    const choice = e.target.closest('.choice');
    if (!choice) return;
    const qid = choice.dataset.qid;
    container.querySelectorAll(`.choice[data-qid="${qid}"]`).forEach(el => el.classList.remove('selected'));
    choice.classList.add('selected');
    choice.querySelector('input').checked = true;
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    const answers = {};
    let allAnswered = true;

    domain.questions.forEach(q => {
      const checked = container.querySelector(`input[name="${q.id}"]:checked`);
      if (checked) {
        answers[q.id] = parseInt(checked.value);
      } else {
        allAnswered = false;
        const card = document.getElementById(`card-${q.id}`);
        card.style.border = '2px solid #E53935';
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    if (!allAnswered) {
      document.getElementById('error-msg').classList.add('show');
      return;
    }

    document.getElementById('error-msg').classList.remove('show');
    localStorage.setItem(evalStorageKey, JSON.stringify(answers));
    window.location.href = nextPage;
  });
})();
