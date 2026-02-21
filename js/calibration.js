/* ============================================
   Step 4 – Study Speed Calibration
   ============================================ */

const Calibration = (() => {
    const PASSAGE = `In computer science, a data structure is a particular way of organizing and storing data so that it can be accessed and modified efficiently. Different kinds of data structures are suited to different kinds of applications, and some are highly specialized. For example, arrays allow random access to elements using an index, while linked lists provide efficient insertion and deletion. Trees organize data hierarchically, enabling fast search operations in structures like binary search trees, where lookup time is proportional to the logarithm of the number of elements. Hash tables achieve near-constant time access by mapping keys to positions using a hash function. Understanding these trade-offs between time and space complexity is a fundamental aspect of algorithm design and analysis, forming the backbone of efficient software development.`;

    let timer = null;
    let startTime = 0;
    let readingSeconds = 0;
    let selectedOption = null;

    function init() {
        document.getElementById('step4Back').addEventListener('click', () => CramPlan.goToStep(3));
        document.getElementById('step4Next').addEventListener('click', generatePlan);
        document.getElementById('startReadingBtn').addEventListener('click', startReading);
        document.getElementById('doneReadingBtn').addEventListener('click', doneReading);
    }

    function start() {
        document.getElementById('calibrationPassage').textContent = PASSAGE;
        document.getElementById('startReadingBtn').style.display = 'inline-flex';
        document.getElementById('doneReadingBtn').style.display = 'none';
        document.getElementById('calibrationTimer').style.display = 'none';
        document.getElementById('calibrationResult').style.display = 'none';
        document.getElementById('timeOptions').style.display = 'none';
        document.getElementById('step4Next').style.display = 'none';
        selectedOption = null;
    }

    function startReading() {
        startTime = Date.now();
        document.getElementById('startReadingBtn').style.display = 'none';
        document.getElementById('doneReadingBtn').style.display = 'inline-flex';
        document.getElementById('calibrationTimer').style.display = 'flex';

        timer = setInterval(() => {
            readingSeconds = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById('timerValue').textContent = readingSeconds + 's';
        }, 200);
    }

    function doneReading() {
        clearInterval(timer);
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        const wordCount = PASSAGE.trim().split(/\s+/).length;
        const wpm = Math.round((wordCount / elapsed) * 60);

        CramPlan.state.userWPM = wpm;
        CramPlan.state.calibrated = true;

        document.getElementById('doneReadingBtn').style.display = 'none';

        const resultEl = document.getElementById('calibrationResult');
        resultEl.style.display = 'block';
        resultEl.innerHTML = `✅ Your reading speed: <strong>${wpm} words/min</strong> (${wordCount} words in ${Math.round(elapsed)}s)`;

        showTimeOptions(wpm);
    }

    function showTimeOptions(wpm) {
        const optionsEl = document.getElementById('timeOptions');
        optionsEl.style.display = 'grid';

        // Offer 3 study pace options
        const fast = Math.round(wpm * 1.2);
        const normal = wpm;
        const slow = Math.round(wpm * 0.7);

        optionsEl.innerHTML = `
      <div class="time-option-btn" data-wpm="${fast}">
        <span class="time-value">⚡ Fast</span>
        <span class="time-label">${fast} WPM – I'll skim quickly</span>
      </div>
      <div class="time-option-btn selected" data-wpm="${normal}">
        <span class="time-value">📖 Normal</span>
        <span class="time-label">${normal} WPM – My tested pace</span>
      </div>
      <div class="time-option-btn" data-wpm="${slow}">
        <span class="time-value">🐢 Thorough</span>
        <span class="time-label">${slow} WPM – I'll study carefully</span>
      </div>
    `;

        selectedOption = normal;

        optionsEl.querySelectorAll('.time-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                optionsEl.querySelectorAll('.time-option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedOption = parseInt(btn.dataset.wpm);
                CramPlan.state.userWPM = selectedOption;
            });
        });

        document.getElementById('step4Next').style.display = 'inline-flex';
    }

    function generatePlan() {
        if (!CramPlan.state.calibrated) {
            CramPlan.toast('Please complete the reading test first', 'error');
            return;
        }

        CramPlan.showLoading('Generating your personalized study plan...');

        // Simulate processing time for UX
        setTimeout(() => {
            // 1. Reduce content
            ContentReducer.reduceAll();
            // 2. Build study plan
            StudyPlanner.buildPlan();
            // 3. Show dashboard
            CramPlan.hideLoading();
            CramPlan.showDashboard();
            Dashboard.init();
            CramPlan.toast('Study plan generated! 🎉', 'success');
        }, 1500);
    }

    return { init, start };
})();
