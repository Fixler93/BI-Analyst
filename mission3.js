// mission3.js - Database Architecture & Normalization

const allColumns = [
    "Supplier_ID", "Supplier_Name", "Contact_Email", "Supplier_Rating",
    "Product_ID", "Product_Name", "Unit_Price", "Category",
    "Status_Code", "Status_Description", "Update_Timestamp",
    "Order_ID", "Quantity", "Total_Cost", "Order_Date",
    "Weather_Condition", "Temp_Notes"
];

let tableCounter = 0;

function initMission3() {
    const pool = document.getElementById('column-pool');
    pool.innerHTML = '';
    
    allColumns.forEach(col => {
        const el = document.createElement('div');
        el.className = 'db-col';
        el.draggable = true;
        el.id = 'col_' + col;
        el.innerHTML = `
            <span>${col} <span class="state-badge pk">PK</span><span class="state-badge calc">Calc</span><span class="fk-label"></span></span>
            <button class="fk-btn" onclick="setFK(event, this)">🔗</button>
        `;
        
        el.addEventListener('dragstart', dragStart);
        
        el.addEventListener('click', (e) => {
            if(e.target.classList.contains('fk-btn')) return;
            if(el.parentElement.id === 'column-pool') return; 

            if (el.classList.contains('state-pk')) {
                el.classList.remove('state-pk');
                el.classList.add('state-calc');
            } else if (el.classList.contains('state-calc')) {
                el.classList.remove('state-calc');
            } else {
                el.classList.add('state-pk');
            }
        });

        pool.appendChild(el);
    });

    addNewTable();
}

function dragStart(e) { e.dataTransfer.setData('text/plain', e.target.id); }
function allowDrop(e) { e.preventDefault(); }

function dropToTable(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text');
    const draggableElement = document.getElementById(id);
    const dropzone = e.target.closest('.db-table-body');
    if (dropzone && draggableElement) {
        dropzone.appendChild(draggableElement);
    }
}

function dropToPool(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text');
    const draggableElement = document.getElementById(id);
    if (draggableElement) {
        draggableElement.classList.remove('state-pk', 'state-calc');
        draggableElement.querySelector('.fk-label').innerText = '';
        draggableElement.removeAttribute('data-fk');
        document.getElementById('column-pool').appendChild(draggableElement);
    }
}

function addNewTable() {
    tableCounter++;
    const ws = document.getElementById('tables-workspace');
    
    const tableCard = document.createElement('div');
    tableCard.className = 'db-table-card';
    tableCard.id = 'table_' + tableCounter;
    
    tableCard.innerHTML = `
        <div class="db-table-header">
            <input type="text" placeholder="Table Name (e.g. Suppliers)" class="tbl-name-input">
            <select class="tbl-norm-select">
                <option value="0">Select Normalization...</option>
                <option value="1NF">1NF</option>
                <option value="2NF">2NF</option>
                <option value="3NF">3NF</option>
                <option value="BCNF">BCNF</option>
            </select>
        </div>
        <div class="db-table-body" ondrop="dropToTable(event)" ondragover="allowDrop(event)">
        </div>
    `;
    ws.appendChild(tableCard);
}

function setFK(event, btnElement) {
    event.stopPropagation();
    const colDiv = btnElement.closest('.db-col');
    if(colDiv.parentElement.id === 'column-pool') {
        alert("גרור את העמודה לטבלה לפני שאתה מגדיר קישור.");
        return;
    }

    const tableName = prompt("הכנס את שם הטבלה שאליה העמודה מקושרת (Foreign Key):");
    if(tableName) {
        colDiv.querySelector('.fk-label').innerText = `-> ${tableName}`;
        colDiv.setAttribute('data-fk', tableName);
    } else {
        colDiv.querySelector('.fk-label').innerText = '';
        colDiv.removeAttribute('data-fk');
    }
}

// ==========================================
// מנוע הציונים לפי אפיון הטבלאות 
// ==========================================
function submitDatabaseDesign() {
    let score = 0;
    let feedback = [];
    
    const tables = document.querySelectorAll('.db-table-card');
    if (tables.length === 0) {
        alert("לא יצרת אף טבלה."); return;
    }

    let userTablesData = Array.from(tables).map(table => {
        return {
            normLevel: table.querySelector('.tbl-norm-select').value,
            columns: Array.from(table.querySelectorAll('.db-col')).map(col => ({
                name: col.id.replace('col_', ''),
                isPK: col.classList.contains('state-pk'),
                isCalc: col.classList.contains('state-calc'),
                hasFK: col.hasAttribute('data-fk')
            }))
        };
    });

    // 1. טבלת ספקים (25 נקודות)
    if (userTablesData.some(t => t.columns.some(c => c.name === "Supplier_ID"))) {
        const t = userTablesData.find(t => t.columns.some(c => c.name === "Supplier_ID"));
        if (t.columns.find(c => c.name === "Supplier_ID" && c.isPK)) { score += 25; } 
        else { feedback.push("Supplier_ID חייב להיות מסומן כמפתח ראשי (PK)."); }
    } else { feedback.push("חסרה טבלת ספקים עם Supplier_ID."); }

    // 2. טבלת מוצרים (25 נקודות)
    if (userTablesData.some(t => t.columns.some(c => c.name === "Product_ID"))) {
        const t = userTablesData.find(t => t.columns.some(c => c.name === "Product_ID"));
        if (t.columns.find(c => c.name === "Product_ID" && c.isPK)) { score += 25; } 
        else { feedback.push("Product_ID חייב להיות מסומן כמפתח ראשי (PK)."); }
    } else { feedback.push("חסרה טבלת מוצרים עם Product_ID."); }

    // 3. טבלת הזמנות (25 נקודות)
    if (userTablesData.some(t => t.columns.some(c => c.name === "Order_ID"))) {
        const t = userTablesData.find(t => t.columns.some(c => c.name === "Order_ID"));
        let orderScore = 0;
        
        if (t.columns.find(c => c.name === "Order_ID" && c.isPK)) { orderScore += 10; } 
        else { feedback.push("Order_ID חייב להיות מפתח ראשי בטבלת הזמנות."); }
        
        if (t.columns.find(c => c.name === "Total_Cost" && c.isCalc)) { orderScore += 10; } 
        else { feedback.push("Total_Cost חייב להיות שדה מחושב (Calc) בהזמנות."); }
        
        // וידוא שעמודת הסטטוס נמצאת כאן ויש לה לינק FK
        const hasStatusFK = t.columns.some(c => (c.name === "Status_Code" || c.name === "Status_Description") && c.hasFK);
        if (hasStatusFK) { orderScore += 5; } 
        else { feedback.push("חובה למקם את עמודת הסטטוס (קוד או תיאור) בהזמנות ולהוסיף לה קישור 🔗 (FK)."); }

        score += orderScore;
    } else { feedback.push("חסרה טבלת הזמנות מרכזית עם Order_ID."); }

    // 4. טבלת סטטוסים (25 נקודות) - צריכה להכיל 2 מפתחות וללא ה-Order_ID
    const statusTable = userTablesData.find(t => 
        !t.columns.some(c => c.name === "Order_ID") && 
        (t.columns.some(c => c.name === "Status_Code") || t.columns.some(c => c.name === "Status_Description"))
    );

    if (statusTable) {
        let statScore = 0;
        const hasCodePK = statusTable.columns.find(c => c.name === "Status_Code" && c.isPK);
        const hasDescPK = statusTable.columns.find(c => c.name === "Status_Description" && c.isPK);
        
        if (hasCodePK && hasDescPK) { statScore += 15; } 
        else { feedback.push("טבלת הסטטוסים החיצונית צריכה להכיל גם קוד וגם תיאור, ושניהם מפתחות ראשיים (PK)."); }
        
        if (statusTable.normLevel === "1NF") { statScore += 10; } 
        else { feedback.push("טבלת הסטטוסים צריכה להיות ברמת נרמול 1NF."); }
        
        score += statScore;
    } else { feedback.push("חסרה טבלת ייחוס לסטטוסים בנפרד מההזמנות."); }

    if(score > 100) score = 100;
    if(score < 0) score = 0;

    showScoreModal(score, feedback);
}

function showScoreModal(score, feedbackMessages) {
    const modal = document.getElementById('m3-score-modal');
    const scoreCircle = document.getElementById('score-display');
    const feedbackText = document.getElementById('score-feedback');
    
    modal.classList.remove('hidden');
    
    let currentScore = 0;
    const interval = setInterval(() => {
        if(currentScore >= score) {
            clearInterval(interval);
            scoreCircle.innerText = score;
            
            if(score < 50) scoreCircle.style.backgroundColor = '#ef4444'; 
            else if(score < 90) scoreCircle.style.backgroundColor = '#f59e0b'; 
            else scoreCircle.style.backgroundColor = '#10b981'; 

            feedbackText.innerHTML = feedbackMessages.length > 0 ? 
                "<ul style='text-align:right; color:#ef4444; font-size:0.9em; padding-right:15px; margin-top:20px;'>" + feedbackMessages.map(m => `<li>${m}</li>`).join('') + "</ul>" : 
                "<div style='margin-top:20px;'><span style='color:#10b981; font-weight:bold; font-size:1.2em;'>מבנה מושלם! עבודה של DBA אמיתי. הוכחת את עצמך.</span></div>";
        } else {
            currentScore += 2;
            if(currentScore > score) currentScore = score;
            scoreCircle.innerText = currentScore;
        }
    }, 20);
}