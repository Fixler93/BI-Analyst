// script.js

let currentData = []; // השמירה של הנתונים הנוכחיים בטבלה כדי לאפשר חיפוש

// פונקציה להתחלת המשימה ומעבר מסך
function startMission() {
    const nameInput = document.getElementById('playerName').value;
    if (nameInput.trim() === '') {
        alert('אנא הכנס את שמך כדי להתחיל');
        return;
    }

    // החלפת מסכים
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('mission-page').classList.remove('hidden');
    document.getElementById('mission-page').classList.add('active');

    // עדכון ברכה לשחקן
    document.getElementById('playerGreeting').innerText = `שלום ${nameInput}, מנהל/ת אספקה. בוקר טוב! יש לנו בעיה בייצור, נראה שחסר לנו חומר גלם קריטי. תעבור על הנתונים ותגיד לנו מה חסר.`;
}

// פונקציה לטעינת טבלה ספציפית
function openTable(tableName) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '<p>טוען נתונים...</p>';
    document.getElementById('controls-container').classList.remove('hidden');

    // פנייה לתיקיית data לקובץ הרלוונטי
    fetch(`data/${tableName}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('לא הצלחנו לטעון את הנתונים');
            }
            return response.json();
        })
        .then(data => {
            currentData = data;
            renderTable(data);
        })
        .catch(error => {
            tableContainer.innerHTML = `<p style="color:red;">שגיאה: ${error.message}. ודא שהקובץ data/${tableName}.json קיים.</p>`;
        });
}

// פונקציה ליצירת והצגת הטבלה
function renderTable(data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = ''; // מחיקת הטבלה הקודמת בלבד!

    if (data.length === 0) {
        tableContainer.innerHTML = '<p>אין נתונים להציג</p>';
        return;
    }

    const table = document.createElement('table');
    const header = table.createTHead();
    const body = table.createTBody();

    // כותרות
    const columns = Object.keys(data[0]);
    const headerRow = header.insertRow();
    columns.forEach(col => {
        const th = document.createElement('th');
        th.innerText = col;
        headerRow.appendChild(th);
    });

    // שורות נתונים
    data.forEach(item => {
        const row = body.insertRow();
        columns.forEach(col => {
            const cell = row.insertCell();
            cell.innerText = item[col];
        });
    });

    tableContainer.appendChild(table);
}

// מאזין לאירוע חיפוש
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = currentData.filter(item => {
        return Object.values(item).some(value => 
            value.toString().toLowerCase().includes(searchTerm)
        );
    });
    renderTable(filteredData);
});

// פונקציה לבדיקת התשובה למשימה הראשונה
function checkAnswer() {
    const answer = document.getElementById('missionAnswer').value.trim().toLowerCase();
    const feedback = document.getElementById('feedbackMessage');
    
    // לדוגמה: התשובה הנכונה היא "פלדה" או "steel" (תגדיר לפי ה-JSON שלך)
    if (answer === 'פלדה' || answer === 'steel') {
        feedback.style.color = 'lightgreen';
        feedback.innerText = 'מצוין! זיהית נכון. משימה 1 הושלמה!';
    } else {
        feedback.style.color = '#ef4444';
        feedback.innerText = 'טעות. נסה לנתח את הנתונים שוב.';
    }
}
