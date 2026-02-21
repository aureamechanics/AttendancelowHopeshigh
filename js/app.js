/* ============================================
   CramPlan – App Shell & State Management
   ============================================ */

const CramPlan = (() => {
  // ---- Central State ----
  const state = {
    currentStep: 1,
    subject: '',
    examDate: '',
    examTime: '',
    timeRemainingMs: 0,
    chapters: [],
    // Each chapter: { name, importance, topics: string, material: string }
    userWPM: 200, // default
    calibrated: false,
    studyPlan: [],
    condensedNotes: {},
    completedTopics: new Set(),
    activeTopicIndex: -1,
  };

  // ---- DOM cache ----
  let stepViews, progressSteps, lineFills;

  function init() {
    stepViews = document.querySelectorAll('.step-view');
    progressSteps = document.querySelectorAll('.progress-step');
    lineFills = [
      document.getElementById('line1'),
      document.getElementById('line2'),
      document.getElementById('line3'),
    ];

    createParticles();
    ExamInput.init();
    SyllabusInput.init();
    MaterialInput.init();
    Calibration.init();
  }

  // ---- Step Navigation ----
  function goToStep(step) {
    state.currentStep = step;
    stepViews.forEach(v => v.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');

    progressSteps.forEach((ps, i) => {
      const s = i + 1;
      ps.classList.remove('active', 'completed');
      if (s < step) ps.classList.add('completed');
      if (s === step) ps.classList.add('active');
    });

    lineFills.forEach((l, i) => {
      l.style.width = (i + 1 < step) ? '100%' : '0%';
    });
  }

  function showDashboard() {
    document.querySelector('.step-views').style.display = 'none';
    document.getElementById('progressBarContainer').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- Background Particles ----
  function createParticles() {
    const container = document.getElementById('bgParticles');
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = (Math.random() * 5) + 's';
      p.style.animationDuration = (3 + Math.random() * 4) + 's';
      container.appendChild(p);
    }
  }

  // ---- Toast ----
  function toast(message, type = 'info') {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // ---- Loading Overlay ----
  function showLoading(text) {
    const overlay = document.createElement('div');
    overlay.className = 'generating-overlay';
    overlay.id = 'generatingOverlay';
    overlay.innerHTML = `
      <div class="generating-spinner"></div>
      <div class="generating-text">${text}</div>
    `;
    document.body.appendChild(overlay);
  }

  function hideLoading() {
    const el = document.getElementById('generatingOverlay');
    if (el) el.remove();
  }

  return {
    state,
    init,
    goToStep,
    showDashboard,
    toast,
    showLoading,
    hideLoading,
  };
})();
