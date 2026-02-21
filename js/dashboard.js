/* ============================================
   Study Dashboard
   Displays plan, timer, progress, condensed notes
   ============================================ */

const Dashboard = (() => {
    let countdownInterval = null;
    let studyTimerInterval = null;
    let studyTimerSeconds = 0;
    let studyTimerRunning = false;

    function init() {
        renderCountdown();
        renderTopicList();
        updateProgress();

        document.getElementById('generatePdfBtn').addEventListener('click', () => {
            PdfExport.generate();
        });

        document.getElementById('startStudyTimerBtn').addEventListener('click', toggleStudyTimer);
        document.getElementById('completeTopicBtn').addEventListener('click', completeCurrentTopic);

        // Start countdown
        countdownInterval = setInterval(renderCountdown, 1000);
    }

    function renderCountdown() {
        const examDateTime = new Date(CramPlan.state.examDate + 'T' + CramPlan.state.examTime);
        const diff = examDateTime - new Date();

        const el = document.getElementById('examCountdown');

        if (diff <= 0) {
            el.innerHTML = '<div class="countdown-segment" style="border-color:var(--danger);"><span class="cd-value" style="color:var(--danger);">!</span><span class="cd-label">Exam Time!</span></div>';
            return;
        }

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        el.innerHTML = `
      ${days > 0 ? `<div class="countdown-segment"><span class="cd-value">${days}</span><span class="cd-label">Days</span></div>` : ''}
      <div class="countdown-segment"><span class="cd-value">${String(hours).padStart(2, '0')}</span><span class="cd-label">Hours</span></div>
      <div class="countdown-segment"><span class="cd-value">${String(mins).padStart(2, '0')}</span><span class="cd-label">Minutes</span></div>
      <div class="countdown-segment"><span class="cd-value">${String(secs).padStart(2, '0')}</span><span class="cd-label">Seconds</span></div>
    `;
    }

    function renderTopicList() {
        const list = document.getElementById('topicsList');
        list.innerHTML = '';

        CramPlan.state.studyPlan.forEach((topic, idx) => {
            const item = document.createElement('div');
            item.className = 'topic-item' + (topic.status === 'skip' ? ' skipped' : '') +
                (CramPlan.state.completedTopics.has(topic.id) ? ' completed' : '');
            item.dataset.index = idx;

            const statusIcon = CramPlan.state.completedTopics.has(topic.id) ? '✅' :
                topic.status === 'skip' ? '⏭️' : '📖';

            item.innerHTML = `
        <div class="topic-priority-dot ${topic.importance}"></div>
        <div class="topic-info">
          <div class="topic-name">${escapeHtml(topic.name)}</div>
          <div class="topic-chapter">${escapeHtml(topic.chapter)}</div>
        </div>
        <div class="topic-time">${topic.status === 'skip' ? 'Skip' : topic.allocatedMinutes + ' min'}</div>
        <div class="topic-status-icon">${statusIcon}</div>
      `;

            if (topic.status !== 'skip') {
                item.addEventListener('click', () => selectTopic(idx));
            }

            list.appendChild(item);
        });
    }

    function selectTopic(idx) {
        const state = CramPlan.state;
        state.activeTopicIndex = idx;
        const topic = state.studyPlan[idx];

        // Highlight
        document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`.topic-item[data-index="${idx}"]`).classList.add('active');

        // Show condensed notes
        const notes = state.condensedNotes[topic.chapterIndex];
        const content = document.getElementById('studyContent');

        if (!notes || !notes.sections || notes.sections.length === 0) {
            content.innerHTML = `<div class="empty-state"><span class="empty-icon">📝</span><p>No condensed notes available for this topic.</p></div>`;
        } else {
            let html = `<h3>${escapeHtml(topic.name)} <span style="font-size:0.75rem;color:var(--text-muted);">— ${escapeHtml(topic.chapter)}</span></h3>`;

            if (notes.reductionPercent) {
                html += `<div style="margin-bottom:16px;padding:8px 14px;background:rgba(168,85,247,0.06);border-radius:8px;font-size:0.8rem;color:var(--accent-3);">📊 Material reduced by <strong>${notes.reductionPercent}%</strong> (${notes.keptSentences} of ${notes.totalSentences} key sentences kept)</div>`;
            }

            notes.sections.forEach(section => {
                html += `<div class="condensed-section"><h4>${section.title}</h4>`;
                section.items.forEach(item => {
                    const className = section.type === 'definition' ? 'key-definition' :
                        section.type === 'formula' ? 'key-formula' : 'key-point';
                    html += `<div class="${className}">${highlightKeywords(escapeHtml(item), state.chapters[topic.chapterIndex].topics)}</div>`;
                });
                html += '</div>';
            });

            // Quick revision
            if (notes.quickRevision && notes.quickRevision.length > 0) {
                html += `<div class="condensed-section"><h4>🚀 Quick Revision (Top ${notes.quickRevision.length} Points)</h4>`;
                notes.quickRevision.forEach((item, i) => {
                    html += `<div class="key-point"><strong>${i + 1}.</strong> ${escapeHtml(item)}</div>`;
                });
                html += '</div>';
            }

            content.innerHTML = html;
        }

        // Show study timer
        document.getElementById('studyTimer').style.display = 'flex';
        resetStudyTimer();
    }

    function highlightKeywords(text, topicsStr) {
        const keywords = topicsStr.split('\n')
            .flatMap(t => t.trim().split(/\s+/))
            .filter(w => w.length > 3)
            .map(w => w.toLowerCase());

        const uniqueKw = [...new Set(keywords)];

        uniqueKw.forEach(kw => {
            const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
            text = text.replace(regex, '<strong style="color:var(--accent-3);">$1</strong>');
        });

        return text;
    }

    function toggleStudyTimer() {
        const btn = document.getElementById('startStudyTimerBtn');
        if (studyTimerRunning) {
            clearInterval(studyTimerInterval);
            studyTimerRunning = false;
            btn.textContent = '▶';
        } else {
            studyTimerRunning = true;
            btn.textContent = '⏸';
            studyTimerInterval = setInterval(() => {
                studyTimerSeconds++;
                const m = String(Math.floor(studyTimerSeconds / 60)).padStart(2, '0');
                const s = String(studyTimerSeconds % 60).padStart(2, '0');
                document.getElementById('studyTimerValue').textContent = `${m}:${s}`;
            }, 1000);
        }
    }

    function resetStudyTimer() {
        clearInterval(studyTimerInterval);
        studyTimerRunning = false;
        studyTimerSeconds = 0;
        document.getElementById('studyTimerValue').textContent = '00:00';
        document.getElementById('startStudyTimerBtn').textContent = '▶';
    }

    function completeCurrentTopic() {
        const idx = CramPlan.state.activeTopicIndex;
        if (idx < 0) return;

        const topic = CramPlan.state.studyPlan[idx];
        CramPlan.state.completedTopics.add(topic.id);

        renderTopicList();
        updateProgress();
        resetStudyTimer();

        CramPlan.toast(`Completed: ${topic.name}`, 'success');

        // Auto-select next non-completed topic
        const next = CramPlan.state.studyPlan.findIndex((t, i) =>
            i > idx && t.status === 'study' && !CramPlan.state.completedTopics.has(t.id)
        );
        if (next >= 0) {
            selectTopic(next);
        } else {
            document.getElementById('studyTimer').style.display = 'none';
            document.getElementById('studyContent').innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🎉</span>
          <p>All topics completed! You're ready for the exam!</p>
        </div>
      `;
        }
    }

    function updateProgress() {
        const total = CramPlan.state.studyPlan.filter(t => t.status === 'study').length;
        const done = CramPlan.state.completedTopics.size;
        document.getElementById('progressSummary').textContent = `${done} / ${total} completed`;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init };
})();
