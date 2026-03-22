// main.js - הלוגיקה הכללית של המערכת (ניווט וטעינת נתונים חכמה)

let currentData = [];
let activeFilters = {}; 

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
            activeFilters = {}; 
            buildTableStructure(data, containerId);
        })
        .catch(error => {
            tableContainer.innerHTML = `<p style="color:red; text-align:center;">Error: ${error.message}. Please check data/${tableName}.json</p>`;
        });
}

function buildTableStructure(data, containerId) {
    const tableContainer = document.getElementById(containerId);
    tableContainer.innerHTML = ''; 

    if (data.length === 0) {
        tableContainer.innerHTML = '<p style="text-align:center;">No data available</p>';
        return;
    }

    // יצירת העטיפה לגלילה הפנימית
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';

    const table = document.createElement('table');
    const header = document.createElement('thead');
    table.appendChild(header);
    const body = document.createElement('tbody');
    table.appendChild(body);

    const columns = Object.keys(data[0]);
    
    const headerRow = header.insertRow();
    columns.forEach(col => {
        const th = document.createElement('th');
        th.innerText = col;
        headerRow.appendChild(th);
    });

    const filterRow = header.insertRow();
    filterRow.style.backgroundColor = '#f1f5f9';
    columns.forEach(col => {
        const th = document.createElement('th');
        th.style.padding = '8px';
        th.style.borderBottom = '2px solid #cbd5e1';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `🔍 Filter ${col}...`;
        input.style.width = '100%';
        input.style.padding = '6px';
        input.style.boxSizing = 'border-box';
        input.style.border = '1px solid #cbd5e1';
        input.style.borderRadius = '4px';
        input.style.fontSize = '0.85em';

        input.addEventListener('input', (e) => {
            activeFilters[col] = e.target.value.toLowerCase();
            updateTableBody(body, columns);
        });
        
        th.appendChild(input);
        filterRow.appendChild(th);
    });

    wrapper.appendChild(table);
    tableContainer.appendChild(wrapper);
    
    updateTableBody(body, columns);
}

function updateTableBody(tbody, columns) {
    tbody.innerHTML = ''; 

    const filteredData = currentData.filter(item => {
        return columns.every(col => {
            if (!activeFilters[col]) return true; 
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