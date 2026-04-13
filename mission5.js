// mission5.js - Free Text SQL & Inventory Analytics

function initMission5() {
    // מנקים טבלאות ישנות כדי למנוע כפילויות במעברי מסכים
    alasql('DROP TABLE IF EXISTS draws');
    alasql('DROP TABLE IF EXISTS arrivals');

    // טעינה ומוכנות של טבלת המשיכות
    fetch('data/material_draws.json')
        .then(res => res.json())
        .then(data => {
            alasql('CREATE TABLE draws');
            alasql('SELECT * INTO draws FROM ?', [data]);
        })
        .catch(err => console.error("Error loading draws:", err));

    // טעינה ומוכנות של טבלת ההגעות
    fetch('data/material_arrivals.json')
        .then(res => res.json())
        .then(data => {
            alasql('CREATE TABLE arrivals');
            alasql('SELECT * INTO arrivals FROM ?', [data]);
        })
        .catch(err => console.error("Error loading arrivals:", err));
}

function runFreeSQL() {
    const query = document.getElementById('m5-sql-input').value.trim();
    const container = document.getElementById('m5-table-container');
    
    if (!query) {
        container.innerHTML = '<p style="color:red; text-align:center;">Please enter a SQL query.</p>';
        return;
    }

    try {
        // הרצת השאילתה על המנוע - עכשיו כשהטבלאות מלאות בנתונים
        const result = alasql(query);
        renderM5Table(result);
    } catch (err) {
        container.innerHTML = `<div style="color:#ef4444; background:#fee2e2; padding:15px; border-radius:4px; font-family:monospace; direction:ltr; text-align:left;">
            <strong>SQL Error:</strong><br>${err.message}
        </div>`;
    }
}

function showFullTable(tableName) {
    const container = document.getElementById('m5-table-container');
    try {
        const result = alasql(`SELECT * FROM ${tableName}`);
        renderM5Table(result);
    } catch (err) {
        container.innerHTML = `<div style="color:#ef4444; padding:15px;">Error loading table: ${err.message}</div>`;
    }
}

function renderM5Table(data) {
    const container = document.getElementById('m5-table-container');
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No results returned for this query.</p>';
        return;
    }

    const table = document.createElement('table');
    const header = document.createElement('thead');
    const body = document.createElement('tbody');
    table.appendChild(header);
    table.appendChild(body);

    const columns = Object.keys(data[0]);
    const headerRow = header.insertRow();
    columns.forEach(col => {
        const th = document.createElement('th');
        th.innerText = col;
        headerRow.appendChild(th);
    });

    data.forEach(item => {
        const row = body.insertRow();
        columns.forEach(col => {
            const cell = row.insertCell();
            cell.innerText = item[col];
        });
    });

    container.appendChild(table);
}

function submitMission5() {
    const q1Mat = document.getElementById('m5-q1-mat').value;
    const q1Ord = document.getElementById('m5-q1-order').value;
    
    const q2Mat = document.getElementById('m5-q2-mat').value;
    const q2Ord = document.getElementById('m5-q2-order').value;

    const q3Mat = document.getElementById('m5-q3-mat').value;
    const q3Ord = document.getElementById('m5-q3-order').value;

    if (!q1Mat || !q1Ord || !q2Mat || !q2Ord || !q3Mat || !q3Ord) {
        alert("נא למלא את כל השדות לפני ההגשה.");
        return;
    }

    let score = 0;
    if (q1Mat === 'MAT-01') score += 1;
    if (q1Ord === 'yes') score += 1;
    
    if (q2Mat === 'MAT-02') score += 1;
    if (q2Ord === 'yes') score += 1;
    
    if (q3Mat === 'MAT-03') score += 1;
    if (q3Ord === 'no') score += 1;

    if (score === 6) {
        alert("🎉 מושלם! עשית אנליזה מדויקת לדפוסי המלאי ולקבלת ההחלטות.\nהוכחת שליטה מלאה בשרשרת האספקה.");
    } else {
        alert(`יש לך ${6 - score} טעויות בזיהוי או בהחלטות הרכש. חקור שוב את הטבלאות באמצעות SQL.`);
    }
}

function goToMission5() {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.classList.add('hidden');
    });
    document.getElementById('mission5-page').classList.remove('hidden');
    document.getElementById('mission5-page').classList.add('active');
    
    const dbBg = document.getElementById('db-background');
    if(dbBg) dbBg.classList.add('hidden');
    
    initMission5();
}