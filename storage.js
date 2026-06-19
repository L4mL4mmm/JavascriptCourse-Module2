export const STORAGE_KEY = "e_wallet_data";

export let appData = {
    categories: [],
    transactions: []
};

export function saveData() {
    console.log("saveData called", appData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

export function seedInitialData() {
    console.log("seedInitialData called");
    appData.categories = [
        { id: 1, title: "An uong", limit: 3000000 },
        { id: 2, title: "Đi lai", limit: 1000000 },
        { id: 3, title: "Hoc tap", limit: 2000000 }
    ];

    appData.transactions = [
        // Du lieu thang 6
        { id: 101, categoryId: 1, date: "2026-06-05", note: "An toi nha hang", valueMoney: -600000 },
        { id: 102, categoryId: 2, date: "2026-06-10", note: "Nap tien ve xe", valueMoney: -200000 },
        { id: 103, categoryId: 3, date: "2026-06-12", note: "Mua sach giao trinh", valueMoney: -500000 },
        { id: 104, categoryId: 1, date: "2026-06-15", note: "Tien luong ve", valueMoney: 15000000 },
        
        // Du lieu thang 5 (Đe hien thi bang thong ke Summary so sanh)
        { id: 201, categoryId: 1, date: "2026-05-10", note: "Tien luong thang 5", valueMoney: 12000000 },
        { id: 202, categoryId: 1, date: "2026-05-12", note: "Di sieu thi mua do", valueMoney: -1800000 },
        { id: 203, categoryId: 2, date: "2026-05-15", note: "Sua xe may", valueMoney: -400000 }
    ];

    saveData();
}

export function loadData() {
    console.log("loadData called");
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
        seedInitialData();
    } else {
        const parsed = JSON.parse(rawData);
        appData.categories = parsed.categories || [];
        appData.transactions = parsed.transactions || [];
    }
    return appData;
}