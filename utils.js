function calculateProgress() {
  const notes = Object.keys(localStorage).filter(k => k.startsWith("note-"));
  return notes.length;
}

function exportMarkdown() {
  let md = "# Study Notes\n\n";

  roadmap.forEach((phase, pIdx) => {
    md += `## ${phase.phase}\n\n`;
    phase.days.forEach((day, dIdx) => {
      const key = `note-${pIdx}-${dIdx}`;
      const note = localStorage.getItem(key);
      if (note) {
        md += `### ${day.day}: ${day.title}\n`;
        md += `${note}\n\n`;
      }
    });
  });

  const blob = new Blob([md], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "study-notes.md";
  a.click();
}
