// mission1.js - הלוגיקה הספציפית למשימה 1

function checkAnswer() {
    // משיכת התשובה שהוזנה, ניקוי רווחים והמרות כדי לתפוס כל וריאציה
    const rawInput = document.getElementById('missionAnswer').value;
    const answer = rawInput.trim().toLowerCase().replace(/-/g, '');
    const submitBtn = document.querySelector('#mission-page .submit-btn');
    
    // נטרול הכפתור כדי למנוע לחיצות כפולות
    submitBtn.disabled = true;

    // הקפצת חלונית הפידבק מלמעלה
    if (answer === 'steel' || answer === 'mat02') {
        alert('Correct! You identified the bottleneck.\n\nMoving to Mission 2...');
    } else {
        alert('Incorrect. But the supply chain never stops...\n\nMoving to Mission 2...');
    }

    // ה-alert עוצר את ריצת הקוד. ברגע שהמשתמש לוחץ "OK", הקוד ממשיך לכאן:
    goToMission2();
    
    // איפוס שדות למקרה של חזרה עתידית למסך
    submitBtn.disabled = false;
    document.getElementById('missionAnswer').value = '';
}

// פונקציית המעבר בין המסכים
function goToMission2() {
    // הסתרת מסך 1
    document.getElementById('mission-page').classList.remove('active');
    document.getElementById('mission-page').classList.add('hidden');
    
    // הצגת מסך 2
    document.getElementById('mission2-page').classList.remove('hidden');
    document.getElementById('mission2-page').classList.add('active');
}