// Shared logic for domain1.html, domain2.html, domain3.html
(function () {
  const params = new URLSearchParams(window.location.search);
  const domainKey = document.body.dataset.domain; // 'domain1' | 'domain2' | 'domain3'
  const nextPage = document.body.dataset.next;

  const domain = QUESTIONS[domainKey];
  if (!domain) return;

  // Redirect if no teacher info
  if (!State.load('sst_info')) {
    window.location.href = 'index.html';
    return;
  }

  // Render title
  document.getElementById('domain-title').textContent = domain.title;
  document.getElementById('domain-subtitle').textContent = domain.subtitle;

  // Load saved answers
  const saved = State.load(domain.storageKey) || {};

  // Render questions
  const container = document.getElementById('questions-container');
  domain.questions.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `card-${q.id}`;

    const choicesHtml = q.choices
      .map(
        (c) => `
      <label class="choice ${saved[q.id] == c.score ? 'selected' : ''}" data-qid="${q.id}" data-score="${c.score}">
        <input type="radio" name="${q.id}" value="${c.score}" ${saved[q.id] == c.score ? 'checked' : ''} />
        <div class="choice-indicator"></div>
        <span class="choice-score">${c.score} คะแนน</span>
        <span class="choice-text">${c.text}</span>
      </label>`
      )
      .join('');

    card.innerHTML = `
      <div class="question-number">ข้อที่ ${i + 1} จาก ${domain.questions.length}</div>
      <div class="question-text">${q.text}</div>
      <div class="choices">${choicesHtml}</div>
    `;
    container.appendChild(card);
  });

  // Handle choice selection
  container.addEventListener('click', (e) => {
    const choice = e.target.closest('.choice');
    if (!choice) return;

    const qid = choice.dataset.qid;
    const score = choice.dataset.score;

    // Deselect siblings
    container.querySelectorAll(`.choice[data-qid="${qid}"]`).forEach((el) => el.classList.remove('selected'));
    choice.classList.add('selected');
    choice.querySelector('input').checked = true;
  });

  // Submit
  document.getElementById('btn-next').addEventListener('click', () => {
    const answers = {};
    let allAnswered = true;

    domain.questions.forEach((q) => {
      const checked = container.querySelector(`input[name="${q.id}"]:checked`);
      if (checked) {
        answers[q.id] = parseInt(checked.value);
      } else {
        allAnswered = false;
        document.getElementById(`card-${q.id}`).style.border = '2px solid #E53935';
        document.getElementById(`card-${q.id}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    if (!allAnswered) {
      document.getElementById('error-msg').classList.add('show');
      return;
    }

    document.getElementById('error-msg').classList.remove('show');
    State.save(domain.storageKey, answers);
    window.location.href = nextPage;
  });
})();
