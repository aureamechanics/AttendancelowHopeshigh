/* ============================================
   Step 3 – Study Material Input per Chapter
   ============================================ */

const MaterialInput = (() => {
    function init() {
        document.getElementById('step3Back').addEventListener('click', () => CramPlan.goToStep(2));
        document.getElementById('step3Next').addEventListener('click', validateAndNext);
    }

    function render() {
        const container = document.getElementById('materialsContainer');
        container.innerHTML = '';

        CramPlan.state.chapters.forEach((chapter, i) => {
            const badge = chapter.importance;
            const block = document.createElement('div');
            block.className = 'material-block';
            block.innerHTML = `
        <div class="material-block-header">
          <span class="chapter-number">${i + 1}</span>
          <h4>${escapeHtml(chapter.name)}</h4>
          <span class="importance-badge ${badge}">${badge}</span>
        </div>
        <div class="form-group" style="margin-bottom:8px;">
          <label>Paste study material below or upload a text file</label>
          <textarea class="material-textarea" data-index="${i}" placeholder="Paste your study notes, textbook content, or lecture notes for this chapter here...">${escapeHtml(chapter.material)}</textarea>
        </div>
        <div class="material-upload-area">
          <button class="btn btn-secondary btn-sm upload-btn" data-index="${i}">📁 Upload .txt</button>
          <input type="file" class="file-input-hidden" data-index="${i}" accept=".txt,.md,.text" />
          <span class="word-count" data-index="${i}">0 words</span>
        </div>
      `;
            container.appendChild(block);
        });

        // Event listeners
        container.querySelectorAll('.material-textarea').forEach(ta => {
            ta.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                CramPlan.state.chapters[idx].material = e.target.value;
                updateWordCount(idx, e.target.value);
            });
            // Init word count
            updateWordCount(parseInt(ta.dataset.index), ta.value);
        });

        container.querySelectorAll('.upload-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                container.querySelector(`.file-input-hidden[data-index="${idx}"]`).click();
            });
        });

        container.querySelectorAll('.file-input-hidden').forEach(fi => {
            fi.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const text = evt.target.result;
                    CramPlan.state.chapters[idx].material = text;
                    container.querySelector(`.material-textarea[data-index="${idx}"]`).value = text;
                    updateWordCount(idx, text);
                    CramPlan.toast(`Loaded ${file.name}`, 'success');
                };
                reader.readAsText(file);
            });
        });
    }

    function updateWordCount(idx, text) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const el = document.querySelector(`.word-count[data-index="${idx}"]`);
        if (el) el.textContent = words.toLocaleString() + ' words';
    }

    function validateAndNext() {
        let hasAnyMaterial = false;
        CramPlan.state.chapters.forEach(ch => {
            if (ch.material.trim().length > 10) hasAnyMaterial = true;
        });

        if (!hasAnyMaterial) {
            CramPlan.toast('Please add study material for at least one chapter', 'error');
            return;
        }

        CramPlan.goToStep(4);
        Calibration.start();
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init, render };
})();
