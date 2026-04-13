// mission6.js - BI Dashboard Builder & Supplier Scorecard

let m6Data = [];
let dashConfig = {
    left: { type: null, category: null, value: null },
    right: { type: null, category: null, value: null }
};
let selectedSupplier = null;

// פונקציה לייצור דאטא מאסיבי ואקראי-למחצה (חוסך קובץ JSON של אלפי שורות)
function generateMockData() {
    const data = [];
    let idCounter = 1;
    
    const addRecords = (sup, month, total, late) => {
        for(let i=0; i<total; i++) {
            data.push({
                Delivery_ID: "D" + String(idCounter++).padStart(4, '0'),
                Supplier: sup,
                Month: month,
                Is_Late: i < late ? 1 : 0
            });
        }
    };

    // SUP-A: מתנדנד. חודשים מסוימים נופל, באחרים עומד.
    // Dec(20% NO), Jan(9.7% YES), Feb(10% YES), Mar(20% NO)
    addRecords('SUP-A', '2025-12', 65, 13);
    addRecords('SUP-A', '2026-01', 82, 8);
    addRecords('SUP-A', '2026-02', 90, 9);
    addRecords('SUP-A', '2026-03', 75, 15);

    // SUP-B: תותח. עומד בכל היעדים (<15%).
    // Dec(9.5% YES), Jan(10.7% YES), Feb(8.5% YES), Mar(12% YES)
    addRecords('SUP-B', '2025-12', 115, 11);
    addRecords('SUP-B', '2026-01', 130, 14);
    addRecords('SUP-B', '2026-02', 105, 9);
    addRecords('SUP-B', '2026-03', 125, 15);

    // SUP-C: בעייתי מאוד. נכשל בכולם.
    // Dec(20% NO), Jan(25.7% NO), Feb(20% NO), Mar(20% NO)
    addRecords('SUP-C', '2025-12', 55, 11);
    addRecords('SUP-C', '2026-01', 70, 18);
    addRecords('SUP-C', '2026-02', 60, 12);
    addRecords('SUP-C', '2026-03', 85, 17);

    // ספקי "רעש" (SUP-D, SUP-E) כדי לעשות את העוגה מעניינת
    addRecords('SUP-D', '2025-12', 45, 2);
    addRecords('SUP-D', '2026-01', 50, 4);
    addRecords('SUP-E', '2026-02', 38, 1);
    addRecords('SUP-E', '2026-03', 42, 5);

    return data;
}

function initMission6() {
    // טוענים את הנתונים ישירות מהמחולל
    m6Data = generateMockData();

    document.querySelectorAll('.draggable-item').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
    });

    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('id', e.target.id);
    e.dataTransfer.setData('type', e.target.dataset.type);
    e.dataTransfer.setData('value', e.target.dataset.value);
}

function handleDragOver(e) { e.preventDefault(); }

function handleDrop(e) {
    e.preventDefault();
    const draggedType = e.dataTransfer.getData('type');
    const draggedValue = e.dataTransfer.getData('value');
    const targetZone = e.target.closest('.drop-zone');
    
    if (!targetZone) return;

    const acceptType = targetZone.dataset.accept;
    if (acceptType !== draggedType) {
        alert("אי אפשר לזרוק את זה כאן!");
        return;
    }

    const panelId = targetZone.dataset.panel;

    if (draggedType === 'visual') {
        dashConfig[panelId].type = draggedValue;
        dashConfig[panelId].category = null;
        dashConfig[panelId].value = null;
        renderConfigBox(panelId, draggedValue);
    } else if (draggedType === 'field') {
        const slot = targetZone.dataset.slot;
        dashConfig[panelId][slot] = draggedValue;
        targetZone.innerHTML = `✅ ${draggedValue}`;
        targetZone.style.background = '#dcfce7';
        targetZone.style.borderColor = '#10b981';
    }
}

function renderConfigBox(panelId, visualType) {
    const container = document.getElementById(`dash-${panelId}`);
    
    let icon = '';
    if(visualType === 'pie') icon = '🥧 Pie Chart';
    if(visualType === 'bar') icon = '📊 Bar Chart';
    if(visualType === 'line') icon = '📈 Line Chart';
    if(visualType === 'kpi') icon = '💳 KPI Card';
    if(visualType === 'table') icon = '📋 Table';

    container.innerHTML = `
        <div class="config-box">
            <button class="return-btn" onclick="clearPanel('${panelId}')" style="position:absolute; top:5px; left:5px;">🗑️</button>
            <h3 style="margin-top:0;">${icon}</h3>
            <div class="drop-zone slot-zone" data-accept="field" data-panel="${panelId}" data-slot="category" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">
                גרור לפה Axis/Category
            </div>
            <div class="drop-zone slot-zone" data-accept="field" data-panel="${panelId}" data-slot="value" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">
                גרור לפה Values
            </div>
        </div>
    `;
}

function clearPanel(panelId) {
    dashConfig[panelId] = { type: null, category: null, value: null };
    const container = document.getElementById(`dash-${panelId}`);
    container.innerHTML = `<p class="placeholder-text">Drop Visual Here</p>`;
    container.className = 'drop-zone dash-panel';
}

function buildDashboard() {
    let hasPie = false, hasBar = false;

    Object.values(dashConfig).forEach(conf => {
        if (conf.type === 'pie' && conf.category === 'Supplier' && conf.value === 'Delivery_ID') hasPie = true;
        if (conf.type === 'bar' && conf.category === 'Month' && conf.value === 'Is_Late') hasBar = true;
    });

    if (hasPie && hasBar) {
        document.getElementById('m6-builder-section').classList.add('hidden');
        document.getElementById('m6-live-section').classList.remove('hidden');
        renderLiveDashboard();
    } else {
        alert("תצורה שגויה! זכור:\n1. עוגה מציגה משלוחים לפי ספק (Supplier + Delivery_ID).\n2. היסטוגרמה מציגה איחורים לפי חודש (Month + Is_Late).");
    }
}

function renderLiveDashboard() {
    renderPieChart();
    renderBarChart();
}

function renderPieChart() {
    const container = document.getElementById('live-pie');
    
    let totals = {};
    let grandTotal = 0;
    m6Data.forEach(d => { 
        totals[d.Supplier] = (totals[d.Supplier] || 0) + 1; 
        grandTotal++;
    });

    const colors = {
        'SUP-A': '#3b82f6', 'SUP-B': '#10b981', 'SUP-C': '#ef4444',
        'SUP-D': '#f59e0b', 'SUP-E': '#8b5cf6'
    };

    // ציור העוגה עם SVG
    let svgContent = '';
    let currentOffset = 0;
    const circumference = 2 * Math.PI * 25; // הקף המעגל (רדיוס 25)

    Object.keys(totals).forEach(sup => {
        const val = totals[sup];
        const slicePct = val / grandTotal;
        const dashArray = `${slicePct * circumference} ${circumference}`;
        const dashOffset = -currentOffset;
        
        const isActive = selectedSupplier === sup;
        const opacity = (!selectedSupplier || selectedSupplier === sup) ? 1 : 0.3;
        const strokeWidth = isActive ? 55 : 50;

        svgContent += `
            <circle r="25" cx="50" cy="50" fill="transparent"
                    stroke="${colors[sup] || '#ccc'}"
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${dashArray}"
                    stroke-dashoffset="${dashOffset}"
                    style="transition: all 0.3s; opacity: ${opacity}; cursor:pointer;"
                    onclick="selectSupplier('${sup}')">
                <title>${sup}: ${val} משלוחים</title>
            </circle>
        `;
        currentOffset += slicePct * circumference;
    });

    // יצירת מקרא (Legend) קליקבילי
    let legendHtml = '<div style="display:flex; flex-direction:column; gap:10px; margin-right:30px;">';
    Object.keys(totals).forEach(sup => {
        const isActive = selectedSupplier === sup;
        const opacity = (!selectedSupplier || selectedSupplier === sup) ? 1 : 0.4;
        legendHtml += `
            <div onclick="selectSupplier('${sup}')" style="display:flex; align-items:center; gap:10px; cursor:pointer; opacity:${opacity}; transition:0.3s;">
                <div style="width:16px; height:16px; background:${colors[sup] || '#ccc'}; border-radius:4px;"></div>
                <span style="${isActive ? 'font-weight:bold; color:#0f172a;' : 'color:#475569;'}">${sup} (${totals[sup]})</span>
            </div>
        `;
    });
    legendHtml += '</div>';

    container.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; padding:10px;">
            <svg viewBox="0 0 100 100" style="width:220px; height:220px; border-radius:50%; transform: rotate(-90deg); overflow:visible;">
                ${svgContent}
            </svg>
            ${legendHtml}
        </div>
        <p style="text-align:center; font-size:0.85em; color:#64748b; margin-top:20px;">* לחץ על פלח בעוגה או על המקרא כדי לסנן</p>
    `;
}

function selectSupplier(sup) {
    if (selectedSupplier === sup) selectedSupplier = null;
    else selectedSupplier = sup;
    renderLiveDashboard();
}

function renderBarChart() {
    const container = document.getElementById('live-bar');
    
    let filteredData = selectedSupplier ? m6Data.filter(d => d.Supplier === selectedSupplier) : m6Data;
    
    let monthlyStats = {};
    filteredData.forEach(d => {
        if(!monthlyStats[d.Month]) monthlyStats[d.Month] = { total: 0, late: 0 };
        monthlyStats[d.Month].total += 1;
        monthlyStats[d.Month].late += d.Is_Late;
    });

    const months = ['2025-12', '2026-01', '2026-02', '2026-03'];
    let maxLate = Math.max(...months.map(m => monthlyStats[m] ? monthlyStats[m].late : 0), 1);
    
    let html = '<div style="display:flex; justify-content:space-around; align-items:flex-end; height:200px; padding-bottom:30px; border-bottom:2px solid #cbd5e1; position:relative;">';

    months.forEach(m => {
        let stats = monthlyStats[m] || { total: 0, late: 0 };
        let heightPct = (stats.late / maxLate) * 100;
        if (heightPct === 0 && stats.total > 0) heightPct = 5;

        html += `
            <div style="display:flex; flex-direction:column; align-items:center; width:20%;">
                <div style="font-size:0.85em; font-weight:bold; color:#ef4444; margin-bottom:5px;">Late: ${stats.late}</div>
                <div style="font-size:0.8em; color:#64748b; margin-bottom:5px;">(Out of ${stats.total})</div>
                <div style="width:100%; background:#ef4444; height:${heightPct}px; min-height:5px; border-radius:4px 4px 0 0; transition:all 0.3s;"></div>
                <div style="position:absolute; bottom:5px; font-size:0.85em; font-weight:bold;">${m}</div>
            </div>
        `;
    });
    html += '</div>';
    
    if(!selectedSupplier) {
        html += '<div style="text-align:center; color:#ef4444; font-weight:bold; margin-top:15px;">⚠️ מציג כעת איחורים של כלל הספקים יחד! סנן ספק בעוגה.</div>';
    } else {
        html += `<div style="text-align:center; color:#10b981; font-weight:bold; margin-top:15px;">🔍 מסונן לפי ספק: ${selectedSupplier}</div>`;
    }

    container.innerHTML = html;
}

function calculateKPI() {
    const val1 = parseFloat(document.getElementById('calc-val1').value) || 0;
    const val2 = parseFloat(document.getElementById('calc-val2').value) || 1;
    const res = (val1 / val2) * 100;
    document.getElementById('calc-result').innerText = res.toFixed(1) + '%';
}

function submitAssessment() {
    // הפתרונות המדויקים לפי הנתונים הרנדומליים החדשים (פחות מ-15% זה YES)
    const answers = {
        'A-12': 'no',  // 20%
        'A-01': 'yes', // 9.7%
        'A-02': 'yes', // 10%
        'A-03': 'no',  // 20%
        'B-12': 'yes', // 9.5%
        'B-01': 'yes', // 10.7%
        'B-02': 'yes', // 8.5%
        'B-03': 'yes', // 12%
        'C-12': 'no',  // 20%
        'C-01': 'no',  // 25.7%
        'C-02': 'no',  // 20%
        'C-03': 'no'   // 20%
    };

    let allCorrect = true;
    for (let key in answers) {
        const selected = document.querySelector(`input[name="${key}"]:checked`);
        if (!selected || selected.value !== answers[key]) {
            allCorrect = false;
            break;
        }
    }

    if (allCorrect) {
        alert("🏆 מדהים! השתמשת בקרוס-פילטר כדי לחלץ נתונים, עשית חישובים מורכבים במחשבון, וזיהית במדויק את חריגות ה-KPI של הספקים.");
    } else {
        alert("❌ יש לך טעות בחישוב העמידה ב-KPI. זכור: רק ספק שהאיחורים שלו הם *פחות* מ-15% בחודש מסוים מוגדר כעומד ביעד ('כן'). העזר במחשבון!");
    }
}

function goToMission6() {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    document.getElementById('mission6-page').classList.remove('hidden');
    document.getElementById('mission6-page').classList.add('active');
    
    const dbBg = document.getElementById('db-background');
    if(dbBg) dbBg.classList.add('hidden');
    
    initMission6();
}