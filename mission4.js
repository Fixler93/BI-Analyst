const materials = [
    { id: "classic_eoq", name: "ברזל סטנדרטי (MAT-01)", price: "₪15 / ק''ג", consumption: "קבוע, 1,000 ק''ג בחודש", deliverySize: "1,000 ק''ג", deliveryCost: "₪500 למשלוח", description: "מנהל קו הייצור קורא לחומר הזה 'שעון שוויצרי'. המכונות בולעות אותו בקצב אחיד ובלתי פוסק יום אחר יום. המשאית של הספק עוצרת ברציף הפריקה בדיוק ברגע שהגרגיר האחרון אוזל.", correctGraph: "graph_sawtooth" },
    { id: "safety_stock", name: "שבבי סיליקון (MAT-15)", price: "₪120 / יחידה", consumption: "תנודתי, ~500 בחודש", deliverySize: "600 יחידות", deliveryCost: "₪1,200 למשלוח", description: "הסיוט של מנהל הרכש. לפעמים השוק רגוע, ולפעמים יש היסטריה. בגלל שהספק מעבר לים נוטה להתעכב, הדירקטוריון הוציא פקודה חד-משמעית: לעולם, אבל לעולם, לא מגיעים לתחתית המחסן.", correctGraph: "graph_safety" },
    { id: "epq_gradual", name: "חלקי פלסטיק בהזרקה (MAT-03)", price: "₪5 / יחידה", consumption: "קבוע, 2,000 בחודש", deliverySize: "ייצור פנימי (3,000 באצווה)", deliveryCost: "₪300 (עלות סט-אפ)", description: "אנחנו לא תלויים באף ספק חיצוני. כשהמכונה באולם ב' נדלקת, הר המלאי מתחיל לצמוח בהדרגה, למרות שקווי ההרכבה מושכים ממנו חומר במקביל. כשהמכונה נכבית - ההר מתחיל לרדת.", correctGraph: "graph_epq" },
    { id: "lumpy_demand", name: "מנועים כבדים (MAT-35)", price: "₪15,000 / יחידה", consumption: "לא רציף (פרויקטלי)", deliverySize: "לפי הזמנה", deliveryCost: "₪2,500 למשלוח", description: "החלקים האלה מעלים אבק רוב השנה, עד שלפתע מחלקת המכירות חותמת על מגה-פרויקט. ביום אחד המחסן מתרוקן לחלוטין, ואז שוב – דממה מוחלטת חודשים קדימה.", correctGraph: "graph_lumpy" },
    { id: "jit", name: "ארוחות טריות לצוות (MAT-99)", price: "₪35 / מנה", consumption: "100 מנות ביום", deliverySize: "100 מנות", deliveryCost: "₪50 למשלוח", description: "אין לנו אפילו סנטימטר פנוי לאחסן את זה, וגם אסור שזה ישכב שם. הסחורה נוחתת בבוקר, נכנסת ישר לעבודה, ובסוף היום לא נשאר זכר. מחר בבוקר הכל מתחיל מהתחלה.", correctGraph: "graph_jit" }
];

let currentMaterialIndex = 0;

function initMission4() {
    currentMaterialIndex = 0;
    document.querySelectorAll('.graph-card').forEach(card => card.classList.remove('hidden'));
    loadMaterial();
}

function loadMaterial() {
    if (currentMaterialIndex >= materials.length) {
        alert("סיימת את משימה 4! עבודה טובה בזיהוי מודלי המלאי.\n\nמיד נעבור לאתגר המרכזי הבא...");
        goToMission5();
        return;
    }
    const mat = materials[currentMaterialIndex];
    document.getElementById('m4-mat-name').innerText = mat.name;
    document.getElementById('m4-mat-price').innerText = mat.price;
    document.getElementById('m4-mat-consumption').innerText = mat.consumption;
    document.getElementById('m4-mat-delivery').innerText = mat.deliverySize;
    document.getElementById('m4-mat-cost').innerText = mat.deliveryCost;
    document.getElementById('m4-mat-desc').innerText = mat.description;
    document.getElementById('m4-progress').innerText = `חומר ${currentMaterialIndex + 1} מתוך ${materials.length}`;
}

function selectGraph(graphId) {
    const mat = materials[currentMaterialIndex];
    const correctGraphId = mat.correctGraph;
    if (graphId === correctGraphId) {
        alert("מעולה! זיהית נכון את מודל המלאי.");
    } else {
        alert("טעות. התיאור והנתונים תואמים למודל מלאי אחר. הגרף הנכון יוסר כעת כדי שתוכל להמשיך.");
    }
    document.getElementById(correctGraphId).classList.add('hidden');
    currentMaterialIndex++;
    loadMaterial();
}

function goToMission4() {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.classList.add('hidden');
    });
    document.getElementById('mission4-page').classList.remove('hidden');
    document.getElementById('mission4-page').classList.add('active');
    const dbBg = document.getElementById('db-background');
    if(dbBg) dbBg.classList.add('hidden');
    initMission4();
}