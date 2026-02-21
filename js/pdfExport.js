/* ============================================
   PDF Export – Generates condensed study notes PDF
   ============================================ */

const PdfExport = (() => {
    function generate() {
        CramPlan.showLoading('Generating your PDF study notes...');

        setTimeout(() => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({ unit: 'mm', format: 'a4' });
                const state = CramPlan.state;
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 18;
                const contentWidth = pageWidth - margin * 2;
                let y = 0;

                // ---- Cover Page ----
                doc.setFillColor(15, 12, 41);
                doc.rect(0, 0, pageWidth, pageHeight, 'F');

                doc.setFontSize(36);
                doc.setTextColor(168, 85, 247);
                doc.text('CramPlan', pageWidth / 2, 60, { align: 'center' });

                doc.setFontSize(12);
                doc.setTextColor(148, 163, 184);
                doc.text('Last Minute Study Notes', pageWidth / 2, 72, { align: 'center' });

                doc.setFontSize(22);
                doc.setTextColor(241, 245, 249);
                doc.text(state.subject || 'Study Notes', pageWidth / 2, 100, { align: 'center' });

                doc.setFontSize(11);
                doc.setTextColor(148, 163, 184);
                doc.text(`Exam: ${state.examDate}  |  Time: ${state.examTime}`, pageWidth / 2, 115, { align: 'center' });

                const studyTopics = state.studyPlan.filter(t => t.status === 'study');
                const skipTopics = state.studyPlan.filter(t => t.status === 'skip');
                doc.text(`${studyTopics.length} topics to study  |  ${skipTopics.length} topics skipped`, pageWidth / 2, 125, { align: 'center' });

                doc.setFontSize(9);
                doc.setTextColor(100, 116, 139);
                doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

                // ---- Table of Contents ----
                doc.addPage();
                y = margin;
                doc.setFillColor(15, 12, 41);
                doc.rect(0, 0, pageWidth, pageHeight, 'F');

                doc.setFontSize(18);
                doc.setTextColor(168, 85, 247);
                doc.text('Study Plan Overview', margin, y + 8);
                y += 18;

                doc.setFontSize(10);

                studyTopics.forEach((topic, i) => {
                    if (y > pageHeight - 20) {
                        doc.addPage();
                        doc.setFillColor(15, 12, 41);
                        doc.rect(0, 0, pageWidth, pageHeight, 'F');
                        y = margin;
                    }

                    const priorityColor = topic.importance === 'high' ? [239, 68, 68] :
                        topic.importance === 'medium' ? [245, 158, 11] : [34, 197, 94];

                    doc.setFillColor(...priorityColor);
                    doc.circle(margin + 3, y + 1, 2, 'F');

                    doc.setTextColor(241, 245, 249);
                    doc.text(`${i + 1}. ${topic.name}`, margin + 10, y + 3);

                    doc.setTextColor(148, 163, 184);
                    doc.text(`${topic.allocatedMinutes} min`, pageWidth - margin, y + 3, { align: 'right' });

                    y += 8;
                });

                if (skipTopics.length > 0) {
                    y += 6;
                    doc.setFontSize(12);
                    doc.setTextColor(100, 116, 139);
                    doc.text('Skipped Topics (not enough time):', margin, y + 3);
                    y += 10;
                    doc.setFontSize(9);

                    skipTopics.forEach(topic => {
                        if (y > pageHeight - 20) {
                            doc.addPage();
                            doc.setFillColor(15, 12, 41);
                            doc.rect(0, 0, pageWidth, pageHeight, 'F');
                            y = margin;
                        }
                        doc.setTextColor(100, 116, 139);
                        doc.text(`• ${topic.name} (${topic.chapter})`, margin + 5, y + 3);
                        y += 7;
                    });
                }

                // ---- Condensed Notes for each chapter ----
                state.chapters.forEach((chapter, chIdx) => {
                    const notes = state.condensedNotes[chIdx];
                    if (!notes || !notes.sections || notes.sections.length === 0) return;

                    doc.addPage();
                    doc.setFillColor(15, 12, 41);
                    doc.rect(0, 0, pageWidth, pageHeight, 'F');
                    y = margin;

                    // Chapter header
                    doc.setFontSize(16);
                    doc.setTextColor(168, 85, 247);
                    doc.text(chapter.name, margin, y + 6);
                    y += 14;

                    // Importance badge
                    const impColor = chapter.importance === 'high' ? [239, 68, 68] :
                        chapter.importance === 'medium' ? [245, 158, 11] : [34, 197, 94];
                    doc.setFontSize(8);
                    doc.setTextColor(...impColor);
                    doc.text(`[${chapter.importance.toUpperCase()} PRIORITY]`, margin, y + 2);
                    y += 8;

                    if (notes.reductionPercent) {
                        doc.setFontSize(8);
                        doc.setTextColor(148, 163, 184);
                        doc.text(`Material reduced by ${notes.reductionPercent}% (${notes.keptSentences} of ${notes.totalSentences} sentences)`, margin, y + 2);
                        y += 8;
                    }

                    // Sections
                    notes.sections.forEach(section => {
                        if (y > pageHeight - 30) {
                            doc.addPage();
                            doc.setFillColor(15, 12, 41);
                            doc.rect(0, 0, pageWidth, pageHeight, 'F');
                            y = margin;
                        }

                        doc.setFontSize(11);
                        doc.setTextColor(6, 182, 212);
                        doc.text(section.title.replace(/[📘🔢⭐🚀]/g, '').trim(), margin, y + 4);
                        y += 10;

                        doc.setFontSize(9);
                        doc.setTextColor(226, 232, 240);

                        section.items.forEach(item => {
                            const lines = doc.splitTextToSize('• ' + item, contentWidth - 6);
                            lines.forEach(line => {
                                if (y > pageHeight - 15) {
                                    doc.addPage();
                                    doc.setFillColor(15, 12, 41);
                                    doc.rect(0, 0, pageWidth, pageHeight, 'F');
                                    y = margin;
                                }
                                doc.text(line, margin + 3, y + 3);
                                y += 5;
                            });
                            y += 2;
                        });

                        y += 4;
                    });

                    // Quick Revision
                    if (notes.quickRevision && notes.quickRevision.length > 0) {
                        if (y > pageHeight - 40) {
                            doc.addPage();
                            doc.setFillColor(15, 12, 41);
                            doc.rect(0, 0, pageWidth, pageHeight, 'F');
                            y = margin;
                        }

                        doc.setFontSize(11);
                        doc.setTextColor(245, 158, 11);
                        doc.text('Quick Revision', margin, y + 4);
                        y += 10;

                        doc.setFontSize(9);
                        doc.setTextColor(226, 232, 240);

                        notes.quickRevision.forEach((item, i) => {
                            const lines = doc.splitTextToSize(`${i + 1}. ${item}`, contentWidth - 6);
                            lines.forEach(line => {
                                if (y > pageHeight - 15) {
                                    doc.addPage();
                                    doc.setFillColor(15, 12, 41);
                                    doc.rect(0, 0, pageWidth, pageHeight, 'F');
                                    y = margin;
                                }
                                doc.text(line, margin + 3, y + 3);
                                y += 5;
                            });
                            y += 2;
                        });
                    }
                });

                // ---- Save ----
                const filename = `CramPlan_${(state.subject || 'Notes').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                doc.save(filename);

                CramPlan.hideLoading();
                CramPlan.toast('PDF downloaded! Good luck! 📄', 'success');

            } catch (err) {
                CramPlan.hideLoading();
                console.error('PDF generation error:', err);
                CramPlan.toast('PDF generation failed: ' + err.message, 'error');
            }
        }, 800);
    }

    return { generate };
})();
