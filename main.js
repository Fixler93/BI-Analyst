// main.js - הלוגיקה הכללית של המערכת (ניווט וטעינת נתונים חכמה)

let currentData = [];
let activeFilters = {}; // אובייקט שישמור איזה טקסט חיפשנו בכל עמודה

function startMission() {
    const nameInput = document.getElementById('playerName').value;
    if (nameInput.trim() === '') {
        alert('אנא הכנס את שמך כדי להתחיל');
        return;
    }

    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('landing-page').classList.add('hidden');
    
    document.getElementById('mission-page').classList.remove('hidden');
    document.getElementById('mission-page').classList.add('active');

    document.getElementById('playerGreeting').innerText = `שלום ${nameInput}, מנהל/ת אספקה. בוקר טוב! יש לנו בעיה בייצור, נראה שחסר לנו חומר גלם קריטי. תעבור על הנתונים ותגיד לנו מה חסר.`;
}

function openTable(tableName, containerId) {
    const tableContainer = document.getElementById(containerId);
    tableContainer.innerHTML = '<p style="text-align:center;">Loading Data...</p>';
    
    fetch(`data/${tableName}.json`)
        .then(response => {
            if (!response.ok) throw new Error('Data load failed');
            return response.json();
        })
        .then(data => {
            currentData = data;
            activeFilters = {}; // איפוס פילטרים כשפותחים טבלה חדשה
            buildTableStructure(data, containerId);
        })
        .catch(error => {
            tableContainer.innerHTML = `<p style="color:red; text-align:center;">Error: ${error.message}. Please check data/${tableName}.json</p>`;
        });
}

// פונקציה לבניית המעטפת (כותרות ותיבות חיפוש)
function buildTableStructure(data, containerId) {
    const tableContainer = document.getElementById(containerId);
    tableContainer.innerHTML = ''; 

    if (data.length === 0) {
        tableContainer.innerHTML = '<p style="text-align:center;">No data available</p>';
        return;
    }

    const table = document.createElement('table');
    const header = table.createTHead();
    const body = document.createElement('tbody'); // ה-body יישמר בנפרד כדי שנעדכן רק אותו
    table.appendChild(body);

    const columns = Object.keys(data[0]);
    
    // 1. ציור הכותרות הרגילות
    const headerRow = header.insertRow();
    columns.forEach(col => {
        const th = document.createElement('th');
        th.innerText = col;
        headerRow.appendChild(th);
    });

    // 2. שורת פילטרים - תיבת קלט לכל עמודה
    const filterRow = header.insertRow();
    filterRow.style.backgroundColor = '#f1f5f9';
    columns.forEach(col => {
        const th = document.createElement('th');
        th.style.padding = '8px';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `🔍 Filter ${col}...`;
        input.style.width = '100%';
        input.style.padding = '6px';
        input.style.boxSizing = 'border-box';
        input.style.border = '1px solid #cbd5e1';
        input.style.borderRadius = '4px';
        input.style.fontSize = '0.85em';

        // המאזין מעדכן את השורות בלבד, כך שלא מאבדים פוקוס בהקלדה!
        input.addEventListener('input', (e) => {
            activeFilters[col] = e.target.value.toLowerCase();
            updateTableBody(body, columns);
        });
        
        th.appendChild(input);
        filterRow.appendChild(th);
    });

    tableContainer.appendChild(table);
    
    // מילוי הנתונים בפעם הראשונה
    updateTableBody(body, columns);
}

// פונקציה לעדכון השורות עצמן בהתאם לפילטרים
function updateTableBody(tbody, columns) {
    tbody.innerHTML = ''; // מחיקת שורות קודמות

    // סינון לפי כל תיבות הטקסט המלאות
    const filteredData = currentData.filter(item => {
        return columns.every(col => {
            if (!activeFilters[col]) return true; // אם התיבה ריקה, תתעלם
            return String(item[col]).toLowerCase().includes(activeFilters[col]);
        });
    });

    if (filteredData.length === 0) {
        const noDataRow = tbody.insertRow();
        const cell = noDataRow.insertCell();
        cell.colSpan = columns.length;
        cell.innerText = 'No matching records found based on your filters.';
        cell.style.textAlign = 'center';
        cell.style.color = '#94a3b8';
        cell.style.padding = '15px';
        return;
    }

    filteredData.forEach(item => {
        const row = tbody.insertRow();
        columns.forEach(col => {
            const cell = row.insertCell();
            cell.innerText = item[col];
        });
    });
}