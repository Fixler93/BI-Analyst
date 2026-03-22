// mission2.js - בניית שאילתות SQL והרצת הטרמינל במשימה 2

let currentQuery = [];

function addQueryChip(chipValue) {
    currentQuery.push(chipValue);
    updateTerminalDisplay();
}

function clearQuery() {
    currentQuery = [];
    updateTerminalDisplay();
    document.getElementById('query-result').innerHTML = '';
}

function updateTerminalDisplay() {
    document.getElementById('query-text').innerText = currentQuery.join(' ');
}

function runQuery() {
    const resultDiv = document.getElementById('query-result');
    
    if (currentQuery.length === 0) {
        resultDiv.innerHTML = '<span style="color: #ef4444;">Error: Query is empty.</span>';
        return;
    }

    const hasSelect = currentQuery.includes('SELECT');
    const hasFrom = currentQuery.includes('FROM');
    const hasOrders = currentQuery.includes('orders');
    const hasWhere = currentQuery.includes('WHERE');
    const hasAnd = currentQuery.includes('AND');
    const hasStatusCondition = currentQuery.includes("Status = 'Pending Material'");
    const hasMaterialCondition = currentQuery.includes("Material_ID = 'MAT-02'");

    if (!hasSelect || !hasFrom) {
        resultDiv.innerHTML = '<span style="color: #ef4444;">Syntax Error: Missing SELECT or FROM.</span>';
        return;
    }

    // הודעת שגיאה על ניסיון לעשות SUM על טקסט
    if (currentQuery.includes('SUM(Priority)')) {
        resultDiv.innerHTML = '<span style="color: #ef4444;">Data Type Error: Cannot use SUM() on a text column like Priority.</span>';
        return;
    }

    const isCorrect = hasSelect && hasFrom && hasOrders && hasWhere && hasAnd && hasStatusCondition && hasMaterialCondition && 
                      (currentQuery.includes('COUNT(Order_ID)') || currentQuery.includes('COUNT(*)') || currentQuery.includes('COUNT(Product)'));

    if (isCorrect) {
        resultDiv.innerHTML = '<span style="color: #10b981;">[Query Executed Successfully]<br>Result: 4 Orders are stuck specifically due to MAT-02 shortage.</span><br><br><button class="submit-btn" style="background:#10b981; margin-top:10px;" onclick="alert(\'Great Job! Ready for Mission 3?\')">Complete Mission</button>';
    } 
    else if (hasOrders && hasWhere && hasStatusCondition && !hasMaterialCondition) {
        resultDiv.innerHTML = '<span style="color: #f59e0b;">[Query Executed]<br>Result: 7 Orders.<br>Hint: You found ALL delayed orders. Filter specifically for the missing material!</span>';
    }
    else if (hasOrders && hasWhere && hasMaterialCondition && !hasStatusCondition) {
        resultDiv.innerHTML = '<span style="color: #f59e0b;">[Query Executed]<br>Result: 9 Orders.<br>Hint: This includes completed orders that used MAT-02. Filter by Status as well!</span>';
    }
    else if (currentQuery.includes('SUM(Qty_Ordered)')) {
        resultDiv.innerHTML = '<span style="color: #f59e0b;">[Query Executed]<br>Hint: We want to know HOW MANY ORDERS were affected, not the total quantity of items. Try a different aggregation.</span>';
    }
    else {
        resultDiv.innerHTML = '<span style="color: #ef4444;">Error: Check your logic. Make sure to COUNT the orders, specify the right table, and apply BOTH conditions.</span>';
    }
}