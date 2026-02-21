/* ============================================
   Step 2 – Syllabus & Chapter Input
   ============================================ */

const SyllabusInput = (() => {
    let chapterCount = 0;

    function init() {
        document.getElementById('addChapterBtn').addEventListener('click', addChapter);
        document.getElementById('step2Back').addEventListener('click', () => CramPlan.goToStep(1));
        document.getElementById('step2Next').addEventListener('click', validateAndNext);

        // Start with one chapter
        addChapter();
    }

    function addChapter() {
        chapterCount++;
        const container = document.getElementById('chaptersContainer');

        const block = document.createElement('div');
        block.className = 'chapter-block';
        block.dataset.chapterId = chapterCount;
        block.innerHTML = `
      <div class="chapter-block-header">
        <span class="chapter-number">${chapterCount}</span>
        <button class="btn-remove-chapter" title="Remove Chapter" onclick="SyllabusInput.removeChapter(this)">✕</button>
      </div>
      <div class="chapter-fields">
        <div class="form-group" style="margin-bottom:0;">
          <label>Chapter Name</label>
          <input type="text" class="chapter-name-input" placeholder="e.g. Arrays and Linked Lists" />
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Importance</label>
          <select class="chapter-importance-select">
            <option value="high">🔴 High</option>
            <option value="medium" selected>🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
      </div>
      <div class="topics-input-area">
        <label>Key Topics <span style="color:var(--text-muted);font-weight:400;">(one per line)</span></label>
        <textarea class="chapter-topics-input" placeholder="e.g.\nArray operations\nSingly Linked List\nDoubly Linked List\nStack implementation"></textarea>
      </div>
    `;

        container.appendChild(block);
        renumberChapters();
    }

    function removeChapter(btn) {
        const block = btn.closest('.chapter-block');
        block.style.animation = 'fadeOut 0.25s ease forwards';
        setTimeout(() => {
            block.remove();
            renumberChapters();
        }, 250);
    }

    function renumberChapters() {
        const blocks = document.querySelectorAll('.chapter-block');
        blocks.forEach((b, i) => {
            b.querySelector('.chapter-number').textContent = i + 1;
        });
    }

    function validateAndNext() {
        const blocks = document.querySelectorAll('.chapter-block');
        if (blocks.length === 0) {
            CramPlan.toast('Add at least one chapter', 'error');
            return;
        }

        const chapters = [];
        let valid = true;

        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(e => e.classList.remove('form-error'));
        document.querySelectorAll('.error-message').forEach(e => e.remove());

        blocks.forEach((b) => {
            const nameInput = b.querySelector('.chapter-name-input');
            const name = nameInput.value.trim();
            const importance = b.querySelector('.chapter-importance-select').value;
            const topics = b.querySelector('.chapter-topics-input').value.trim();

            if (!name) {
                nameInput.classList.add('form-error');
                valid = false;
            }

            chapters.push({ name, importance, topics, material: '' });
        });

        if (!valid) {
            CramPlan.toast('Please fill in all chapter names', 'error');
            return;
        }

        CramPlan.state.chapters = chapters;
        CramPlan.goToStep(3);
        MaterialInput.render();
    }

    return { init, removeChapter, addChapter };
})();

// Fade-out animation
const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes fadeOut { to { opacity:0; transform:translateY(-10px); height:0; padding:0; margin:0; overflow:hidden; } }`;
document.head.appendChild(styleTag);
