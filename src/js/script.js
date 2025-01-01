document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('noteInput');
    const saveButton = document.getElementById('saveNote');
    const notesContainer = document.getElementById('notesContainer');
    const noteCountElement = document.getElementById('noteCount');
    const wordCountElement = document.getElementById('wordCount');

    // Load existing notes
    loadNotes();
    updateStats();

    // Focus on textarea when page loads
    noteInput.focus();

    // Save note when button is clicked
    saveButton.addEventListener('click', saveNote);

    // Save note when Ctrl+Enter is pressed
    noteInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            saveNote();
        }
    });

    function saveNote() {
        const content = noteInput.value.trim();
        if (!content) return;

        const note = {
            content: content,
            timestamp: new Date().toLocaleString()
        };

        // Get existing notes
        let notes = JSON.parse(localStorage.getItem('flomo-notes') || '[]');
        notes.unshift(note);
        localStorage.setItem('flomo-notes', JSON.stringify(notes));

        // Add new note to DOM
        addNoteToDOM(note);
        updateStats();

        // Clear input
        noteInput.value = '';
        noteInput.focus();
    }

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('flomo-notes') || '[]');
        notes.forEach(note => addNoteToDOM(note));
        updateStats();
    }

    function addNoteToDOM(note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = `
            <div class="note-content">${note.content.replace(/\n/g, '<br>')}</div>
            <div class="note-time">${note.timestamp}</div>
        `;

        // If there are existing notes, insert the new one at the top
        if (notesContainer.firstChild) {
            notesContainer.insertBefore(noteElement, notesContainer.firstChild);
        } else {
            notesContainer.appendChild(noteElement);
        }
    }

    function updateStats() {
        const notes = JSON.parse(localStorage.getItem('flomo-notes') || '[]');
        // Update note count
        noteCountElement.textContent = notes.length;
        
        // Calculate total character count
        const totalChars = notes.reduce((total, note) => {
            return total + note.content.trim().length;
        }, 0);
        wordCountElement.textContent = totalChars;
    }
});
