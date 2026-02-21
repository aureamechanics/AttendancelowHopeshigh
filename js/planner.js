/* ============================================
   Study Planner Engine
   Prioritizes topics & allocates study time
   ============================================ */

const StudyPlanner = (() => {
    const IMPORTANCE_WEIGHT = { high: 3, medium: 2, low: 1 };

    function buildPlan() {
        const state = CramPlan.state;
        const wpm = state.userWPM;

        // Calculate available study time (leave 15% buffer for breaks)
        const examDateTime = new Date(state.examDate + 'T' + state.examTime);
        const availableMs = examDateTime - new Date();
        const availableMinutes = Math.max(0, Math.floor((availableMs * 0.85) / 60000));

        // Build topic list with scores
        const topics = [];

        state.chapters.forEach((chapter, chIdx) => {
            const topicNames = chapter.topics
                .split('\n')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            const impWeight = IMPORTANCE_WEIGHT[chapter.importance] || 2;
            const notes = state.condensedNotes[chIdx];
            const materialWords = chapter.material.trim().split(/\s+/).length;

            // If no topics listed, treat the whole chapter as one topic
            if (topicNames.length === 0) {
                topicNames.push(chapter.name);
            }

            topicNames.forEach((topicName, tIdx) => {
                // Estimate words for this topic (divide material evenly among topics)
                const estimatedWords = Math.ceil(materialWords / topicNames.length);
                // Reading time in minutes at user's WPM (studying is ~60% of reading speed)
                const studyMinutes = Math.max(2, Math.ceil((estimatedWords / (wpm * 0.6))));

                // Priority score
                let priority = impWeight * 10;

                // Boost if topic name has "important" markers
                const lower = topicName.toLowerCase();
                const boostMarkers = ['theorem', 'formula', 'definition', 'algorithm', 'key', 'important', 'types'];
                boostMarkers.forEach(m => {
                    if (lower.includes(m)) priority += 5;
                });

                // Small random variation to break ties
                priority += Math.random() * 2;

                topics.push({
                    id: `${chIdx}-${tIdx}`,
                    name: topicName,
                    chapter: chapter.name,
                    chapterIndex: chIdx,
                    importance: chapter.importance,
                    priority: Math.round(priority * 10) / 10,
                    estimatedMinutes: studyMinutes,
                    allocatedMinutes: 0,
                    status: 'pending', // pending, study, skip
                });
            });
        });

        // Sort by priority (highest first)
        topics.sort((a, b) => b.priority - a.priority);

        // Allocate time
        let remainingMinutes = availableMinutes;

        topics.forEach(topic => {
            if (remainingMinutes >= topic.estimatedMinutes) {
                topic.allocatedMinutes = topic.estimatedMinutes;
                topic.status = 'study';
                remainingMinutes -= topic.estimatedMinutes;
            } else if (remainingMinutes >= 2) {
                // Give remaining time to partially cover this topic
                topic.allocatedMinutes = remainingMinutes;
                topic.status = 'study';
                remainingMinutes = 0;
            } else {
                topic.allocatedMinutes = 0;
                topic.status = 'skip';
            }
        });

        state.studyPlan = topics;
        state.completedTopics = new Set();

        // Log summary
        const studyCount = topics.filter(t => t.status === 'study').length;
        const skipCount = topics.filter(t => t.status === 'skip').length;
        console.log(`Study Plan: ${studyCount} topics to study, ${skipCount} to skip. Available: ${availableMinutes}min, WPM: ${wpm}`);
    }

    return { buildPlan };
})();
