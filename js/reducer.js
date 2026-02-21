/* ============================================
   Content Reduction Engine
   Condenses study material into exam-friendly notes
   ============================================ */

const ContentReducer = (() => {
    // Definition markers
    const DEFINITION_MARKERS = [
        'is defined as', 'refers to', 'is a', 'is the', 'are called',
        'is known as', 'can be defined', 'definition', 'means that',
        'is characterized by', 'is described as', 'represents',
    ];

    const FORMULA_MARKERS = [
        '=', 'formula', 'equation', 'calculate', 'f(', 'O(', 'Θ(',
        'Ω(', 'log', 'sum', '∑', '∫', 'π', '^', 'sqrt',
    ];

    const IMPORTANT_MARKERS = [
        'important', 'key', 'note', 'remember', 'crucial', 'essential',
        'significant', 'critical', 'fundamental', 'primary', 'main',
        'advantage', 'disadvantage', 'difference', 'example', 'types of',
        'properties', 'characteristics', 'features', 'applications',
        'steps', 'process', 'method', 'algorithm', 'theorem',
    ];

    function reduceAll() {
        const state = CramPlan.state;
        state.condensedNotes = {};

        state.chapters.forEach((chapter, chIdx) => {
            if (!chapter.material.trim()) {
                state.condensedNotes[chIdx] = { sections: [], raw: 'No material provided.' };
                return;
            }

            const topics = chapter.topics
                .split('\n')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            const reduced = reduceChapter(chapter.material, topics, chapter.name);
            state.condensedNotes[chIdx] = reduced;
        });
    }

    function reduceChapter(material, topics, chapterName) {
        const sentences = splitSentences(material);
        const paragraphs = material.split(/\n\n+/).filter(p => p.trim());

        // Create keyword set from topics + chapter name
        const keywords = new Set();
        topics.forEach(t => {
            t.toLowerCase().split(/\s+/).forEach(w => {
                if (w.length > 2) keywords.add(w);
            });
        });
        chapterName.toLowerCase().split(/\s+/).forEach(w => {
            if (w.length > 2) keywords.add(w);
        });

        // Score each sentence
        const scored = sentences.map((sentence, idx) => {
            let score = 0;
            const lower = sentence.toLowerCase();

            // Keyword density
            let kwMatches = 0;
            keywords.forEach(kw => {
                if (lower.includes(kw)) kwMatches++;
            });
            score += kwMatches * 3;

            // Position bonus (first and last sentences of paragraphs)
            if (idx === 0 || idx === sentences.length - 1) score += 2;

            // Definition markers
            const isDef = DEFINITION_MARKERS.some(m => lower.includes(m));
            if (isDef) score += 5;

            // Formula markers
            const isFormula = FORMULA_MARKERS.some(m => lower.includes(m));
            if (isFormula) score += 4;

            // Important markers
            const isImportant = IMPORTANT_MARKERS.some(m => lower.includes(m));
            if (isImportant) score += 3;

            // Sentence length penalty (too short or very long)
            const wordCount = sentence.split(/\s+/).length;
            if (wordCount < 4) score -= 2;
            if (wordCount > 50) score -= 1;

            return {
                text: sentence.trim(),
                score,
                isDef,
                isFormula,
                isImportant,
            };
        });

        // Sort by score, take top ~40%
        const sorted = [...scored].sort((a, b) => b.score - a.score);
        const keepCount = Math.max(5, Math.ceil(sorted.length * 0.4));
        const kept = sorted.slice(0, keepCount);

        // Re-sort by original order
        const keptSet = new Set(kept.map(s => s.text));
        const orderedKept = scored.filter(s => keptSet.has(s.text));

        // Group into sections
        const sections = [];

        // Key Definitions
        const definitions = orderedKept.filter(s => s.isDef);
        if (definitions.length > 0) {
            sections.push({
                title: '📘 Key Definitions',
                type: 'definition',
                items: definitions.map(s => s.text),
            });
        }

        // Key Formulas / Technical
        const formulas = orderedKept.filter(s => s.isFormula && !s.isDef);
        if (formulas.length > 0) {
            sections.push({
                title: '🔢 Key Formulas & Technical Points',
                type: 'formula',
                items: formulas.map(s => s.text),
            });
        }

        // Important Points
        const important = orderedKept.filter(s => !s.isDef && !s.isFormula);
        if (important.length > 0) {
            sections.push({
                title: '⭐ Important Points',
                type: 'point',
                items: important.map(s => s.text),
            });
        }

        // Quick revision bullets (top 5 sentences overall)
        const quickRevision = sorted.slice(0, Math.min(5, sorted.length)).map(s => s.text);

        return {
            sections,
            quickRevision,
            totalSentences: sentences.length,
            keptSentences: orderedKept.length,
            reductionPercent: Math.round((1 - orderedKept.length / Math.max(sentences.length, 1)) * 100),
        };
    }

    function splitSentences(text) {
        // Split on sentence boundaries while preserving abbreviations
        return text
            .replace(/\n+/g, ' ')
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 5);
    }

    return { reduceAll };
})();
