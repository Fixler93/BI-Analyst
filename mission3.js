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
        
        // הוספנו כפתור ❌ שמופיע רק כשזה בתוך טבלה
        el.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span>${col} <span class="state-badge pk">PK</span><span class="state-badge calc">Calc</span><span class="fk-label"></span></span>
                <div>
                    <button class="fk-btn" onclick="setFK(event, this)">🔗</button>
                    <button class="return-btn" onclick="returnToPool(event, this)" title="החזר למאגר">❌</button>
                </div>
            </div>
        `;
        
        el.addEventListener('dragstart', dragStart);
        
        el.addEventListener('click', (e) => {
            if(e.target.tagName.toLowerCase() === 'button') return; // לא ללחוץ על הכפתורים
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

function returnToPool(event, btn) {
    event.stopPropagation();
    const col = btn.closest('.db-col');
    col.classList.remove('state-pk', 'state-calc');
    col.querySelector('.fk-label').innerText = '';
    col.removeAttribute('data-fk');
    document.getElementById('column-pool').appendChild(col);
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
    
    // הוספנו כפתור פח אשפה ליד שם הטבלה
    tableCard.innerHTML = `
        <div class="db-table-header" style="position: relative;">
            <button onclick="deleteTable('table_${tableCounter}')" style="position: absolute; left: 5px; top: 5px; background: transparent; border: none; cursor: pointer; color: #ef4444; font-size: 1.2em;" title="מחק טבלה">🗑️</button>
            <input type="text" placeholder="Table Name..." class="tbl-name-input" style="width: 80%; float: right;">
            <div style="clear: both; margin-bottom: 5px;"></div>
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

function deleteTable(tableId) {
    const table = document.getElementById(tableId);
    if(!table) return;
    
    const cols = table.querySelectorAll('.db-col');
    const pool = document.getElementById('column-pool');
    cols.forEach(col => {
        col.classList.remove('state-pk', 'state-calc');
        col.querySelector('.fk-label').innerText = '';
        col.removeAttribute('data-fk');
        pool.appendChild(col);
    });
    
    table.remove();
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
// מנוע הציונים
// ==========================================
function submitDatabaseDesign() {
    let score = 0;
    let feedback = [];
    
    const tables = document.querySelectorAll('.db-table-card');
    if (tables.length === 0) {
        alert("לא יצרת אף טבלה. אתה יכול ליצור טבלאות חדשות עם הכפתור 'הוסף טבלה'."); 
        return;
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

    if (userTablesData.some(t => t.columns.some(c => c.name === "Supplier_ID"))) {
        const t = userTablesData.find(t => t.columns.some(c => c.name === "Supplier_ID"));
        if (t.columns.find(c => c.name === "Supplier_ID" && c.isPK)) { score += 25; } 
        else { feedback.push("Supplier_ID חייב להיות מסומן כמפתח ראשי (PK)."); }
    } else { feedback.push("חסרה טבלת ספקים עם Supplier_ID."); }

    if (userTablesData.some(t => t.columns.some(c => c.name === "Product_ID"))) {
        const t = userTablesData.find(t => t.columns.some(c => c.name === "Product_ID"));
        if (t.columns.find(c => c.name === "Product_ID" && c.isPK)) { score += 25; } 
        else { feedback.push("Product_ID חייב להיות מסומן כמפתח ראשי (PK)."); }
    } else { feedback.push("חסרה טבלת מוצרים עם Product_ID."); }

    if (userTablesData.some(t => t.columns.some(c => c.name === "Order_ID"))) {
        const t = userTablesData.find(t => t.columns.some(c => c.name === "Order_ID"));
        let orderScore = 0;
        
        if (t.columns.find(c => c.name === "Order_ID" && c.isPK)) { orderScore += 10; } 
        else { feedback.push("Order_ID חייב להיות מפתח ראשי בטבלת הזמנות."); }
        
        if (t.columns.find(c => c.name === "Total_Cost" && c.isCalc)) { orderScore += 10; } 
        else { feedback.push("Total_Cost חייב להיות שדה מחושב (Calc) בהזמנות."); }
        
        const hasStatusFK = t.columns.some(c => (c.name === "Status_Code" || c.name === "Status_Description") && c.hasFK);
        if (hasStatusFK) { orderScore += 5; } 
        else { feedback.push("חובה למקם את עמודת הסטטוס (קוד או תיאור) בהזמנות ולהוסיף לה קישור 🔗 (FK)."); }

        score += orderScore;
    } else { feedback.push("חסרה טבלת הזמנות מרכזית עם Order_ID."); }

    const statusTable = userTablesData.find(t => 
        !t.columns.some(c => c.name === "Order_ID") && 
        (t.columns.some(c => c.name === "Weather_Condition"))
    );

    if (statusTable) {
        let statScore = 0;
        const hasCodePK = statusTable.columns.find(c => c.name === "Status_Code" && c.isPK);
        const hasWeatherPK = statusTable.columns.find(c => c.name === "Weather_Condition" && c.isPK);
        
        if (hasCodePK && hasWeatherPK) { statScore += 15; } 
        else { feedback.push("טבלת הסטטוסים ומזג האוויר צריכה להכיל גם את Status_Code וגם את Weather_Condition, כששניהם מפתחות ראשיים (PK)."); }
        
        if (statusTable.normLevel === "1NF") { statScore += 10; } 
        else { feedback.push("טבלת הסטטוסים ומזג האוויר צריכה להיות ברמת נרמול 1NF."); }
        
        score += statScore;
    } else { feedback.push("חסרה טבלת ייחוס (1NF) המשלבת את הסטטוס עם תנאי מזג האוויר בנפרד מההזמנות."); }

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