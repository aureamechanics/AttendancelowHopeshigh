/* ============================================
   Step 1 – Exam Details Input
   ============================================ */

const ExamInput = (() => {
    function init() {
        const dateInput = document.getElementById('examDate');
        const timeInput = document.getElementById('examTime');
        const nextBtn = document.getElementById('step1Next');

        // Default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
        timeInput.value = '09:00';

        dateInput.addEventListener('change', updateTimeRemaining);
        timeInput.addEventListener('change', updateTimeRemaining);
        updateTimeRemaining();

        nextBtn.addEventListener('click', () => {
            const subject = document.getElementById('subjectName').value.trim();
            const date = dateInput.value;
            const time = timeInput.value;

            // Validation
            let valid = true;
            clearErrors();

            if (!subject) {
                showError('subjectName', 'Please enter a subject name');
                valid = false;
            }
            if (!date) {
                showError('examDate', 'Please select an exam date');
                valid = false;
            }
            if (!time) {
                showError('examTime', 'Please select an exam time');
                valid = false;
            }

            const examDateTime = new Date(date + 'T' + time);
            if (examDateTime <= new Date()) {
                showError('examDate', 'Exam date/time must be in the future');
                valid = false;
            }

            if (!valid) return;

            CramPlan.state.subject = subject;
            CramPlan.state.examDate = date;
            CramPlan.state.examTime = time;
            CramPlan.state.timeRemainingMs = examDateTime - new Date();

            CramPlan.goToStep(2);
        });
    }

    function updateTimeRemaining() {
        const date = document.getElementById('examDate').value;
        const time = document.getElementById('examTime').value;
        const display = document.getElementById('timeRemainingDisplay');
        const text = document.getElementById('timeRemainingText');

        if (!date || !time) { display.style.display = 'none'; return; }

        const examDateTime = new Date(date + 'T' + time);
        const diff = examDateTime - new Date();

        if (diff <= 0) {
            display.style.display = 'block';
            text.textContent = 'Exam time has passed!';
            display.querySelector('.time-badge').classList.add('urgent');
            return;
        }

        display.style.display = 'block';
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);

        const badge = display.querySelector('.time-badge');
        badge.classList.toggle('urgent', hours < 6);

        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remHours = hours % 24;
            text.textContent = `${days} day${days > 1 ? 's' : ''} ${remHours}h ${mins}m remaining`;
        } else {
            text.textContent = `${hours}h ${mins}m remaining`;
        }
    }

    function showError(fieldId, msg) {
        const field = document.getElementById(fieldId);
        field.classList.add('form-error');
        const err = document.createElement('div');
        err.className = 'error-message';
        err.textContent = msg;
        field.parentNode.appendChild(err);
    }

    function clearErrors() {
        document.querySelectorAll('.form-error').forEach(el => el.classList.remove('form-error'));
        document.querySelectorAll('.error-message').forEach(el => el.remove());
    }

    return { init };
})();
