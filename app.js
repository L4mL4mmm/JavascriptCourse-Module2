import { loadData, saveData } from "./storage.js";
// tao bien toan cuc vai tro lam bo nho RAM chua du lieu cua toan app
let appData = {
    categories: [],
    transactions: []
};

// tao ham khoi chay cho chuong trinh
function init() {
    console.log("Hàm init chạy: Bắt đầu nạp dữ liệu");
    // load du lieu tu o cung vao RAM
    appData = loadData();
    // tu dong dien thang mac dinh vao o chon lich loc (Thang 6/2026)
    const monthFilter = document.getElementById("month_filter");
    if (monthFilter) {
        monthFilter.value = "2026-06";
        // Lang nghe su kien khi doi thang de ve lai giao dien
        monthFilter.addEventListener("change", renderUI);
    }
    // tu dong dien ngay hom nay vao o chon lich them giao dich
    const dateInput = document.getElementById("tx_date");
    if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }
    // nhan du lieu khi nguoi dung bam submit form
    document.getElementById("category_form").addEventListener("submit", addCategory);
    document.getElementById("transaction_form").addEventListener("submit", addTransaction);
    console.log("init completed - Categories:", appData.categories, "Transactions:", appData.transactions);
    // ve giao dien khi mo web len 
    renderUI();
}
// cho trinh duyet doc xong file html thi chay ham init
window.addEventListener("DOMContentLoaded", init);
// ham them danh muc
function addCategory(event) {
    event.preventDefault();
    const titleInput = document.getElementById("new_category_title");
    const limitInput = document.getElementById("new_category_limit");
    const cleanTitle = titleInput.value.trim();
    const numberLimit = Number(limitInput.value);
    if (!cleanTitle) return;
    const newCat = {
        id: Date.now(), // dung milisec hien tai lam ma ID de khong trung
        title: cleanTitle,
        limit: numberLimit
    };
    // day doi tuong vao mang category trong RAM
    appData.categories.push(newCat);
    saveData(appData);
    console.log("addCategory completed - Categories Array:", appData.categories);
    // goi ham ve lai giao dien ngay luc do
    renderUI();
    // reset form de nguoi dung tiep tuc nhap vao
    event.target.reset();
}
// ham them giao dich moi
function addTransaction(event) {
    event.preventDefault();
    const typeInput = document.getElementById("tx_type");
    const moneyInput = document.getElementById("tx_money");
    const selectCatInput = document.getElementById("form_select");
    const dateInput = document.getElementById("tx_date");
    const noteInput = document.getElementById("tx_note");
    let valueMoney = Number(moneyInput.value);
    // neu do la khoan chi, ta se nhan voi -1 de bien no thanh so am
    if (typeInput.value === "expense") {
        valueMoney = valueMoney * -1;
    }
    const newTx = {
        id: Date.now(),
        categoryId: Number(selectCatInput.value),
        date: dateInput.value,
        note: noteInput.value.trim() || "Khong co ghi chu",
        valueMoney: valueMoney
    };
    // day mang moi vao RAM
    appData.transactions.push(newTx);
    saveData(appData);
    console.log("addTransaction completed - Transactions Array:", appData.transactions);
    // cap nhat lai giao dien
    renderUI();
    // reset form nhung giu lai ngay hom nay de do cong chon lai
    const savedDate = dateInput.value;
    event.target.reset();
    dateInput.value = savedDate;
}
function renderUI() {
    // Lay thang duoc chon de tien hanh loc du lieu theo dung thang 
    const monthFilter = document.getElementById("month_filter");
    const selectedMonth = monthFilter ? monthFilter.value : "2026-06";
    // Loc ra cac giao dich thuoc thang dang chon
    const transactionsInMonth = appData.transactions.filter(tx => tx.date.startsWith(selectedMonth));
    // Khoi 1: Tinh toan, cap nhat Dashboard
    const tongThu = transactionsInMonth
        .filter(tx => tx.valueMoney > 0)
        .reduce((sum, tx) => sum + tx.valueMoney, 0);
    const tongChi = transactionsInMonth
        .filter(tx => tx.valueMoney < 0)
        .reduce((sum, tx) => sum + tx.valueMoney, 0);
    // So du tai khoan duoc tinh bang tong thuong xuyen tich luy thuc te
    const soDu = appData.transactions.reduce((sum, tx) => sum + tx.valueMoney, 0);
    document.getElementById("soDuHienTai").innerText = `${soDu.toLocaleString("vi-VN")} ₫`;
    document.getElementById("thuThangNay").innerText = `+${tongThu.toLocaleString("vi-VN")} ₫`;
    document.getElementById("chiThangNay").innerText = `-${Math.abs(tongChi).toLocaleString("vi-VN")} ₫`;
    //Logic xu ly thanh tien trinh ngan sach tong 
    const nganSachTong = appData.categories.reduce((sum, cat) => sum + cat.limit, 0);
    const absTongChi = Math.abs(tongChi);
    const budgetPercentEl = document.getElementById("budget_percent");
    const budgetProgressEl = document.getElementById("budget_progress");
    const budgetStatusTextEl = document.getElementById("budget_status_text");
    if (nganSachTong > 0) {
        const phanTram = Math.round((absTongChi / nganSachTong) * 100);
        budgetPercentEl.innerText = `Da dung: ${phanTram}%`;
        budgetProgressEl.style.width = `${Math.min(phanTram, 100)}%`;
        if (absTongChi > nganSachTong) {
            budgetPercentEl.innerText += " - VUOT NGAN SACH!";
            budgetProgressEl.style.backgroundColor = "var(--danger-color)";
            budgetStatusTextEl.innerText = `Vuot qua ${(absTongChi - nganSachTong).toLocaleString("vi-VN")} ₫ so voi ngan sach thang.`;
        } else {
            budgetProgressEl.style.backgroundColor = "var(--success-color)";
            budgetStatusTextEl.innerText = `Con lai ${(nganSachTong - absTongChi).toLocaleString("vi-VN")} ₫ trong ngan sach thang.`;
        }
    }
    // Khoi 2: Ve bang danh muc va o chon dropdown
    let htmlCategoryTable = "";
    let htmlDropdownOptions = "";
    if (appData.categories.length === 0) {
        htmlCategoryTable = `<tr><td colspan="4" style="text-align: center; color: #888;">Chua co danh muc nao. Hay them moi!</td></tr>`;
        htmlDropdownOptions = `<option value="">-- Vui long them danh muc --</option>`;
    } else {
        appData.categories.forEach(cat => {
            const daTieu = transactionsInMonth
                .filter(tx => tx.categoryId === cat.id && tx.valueMoney < 0)
                .reduce((sum, tx) => sum + Math.abs(tx.valueMoney), 0);
            let classCanhBao = "";
            if (cat.limit > 0 && daTieu > cat.limit) {
                classCanhBao = "row-danger";
            }
            htmlCategoryTable += `
                <tr class="${classCanhBao}">
                    <td><strong>${cat.title}</strong></td>
                    <td>${cat.limit === 0 ? "Khong gioi han" : cat.limit.toLocaleString("vi-VN") + " ₫"}</td>
                    <td class="${daTieu > cat.limit && cat.limit > 0 ? 'text-danger font-bold' : ''}">${daTieu.toLocaleString("vi-VN")} ₫</td>
                    <td><button class="btn btn-danger" onclick="deleteCategory(${cat.id})">Xoa</button></td>
                </tr>
            `;
            htmlDropdownOptions += `<option value="${cat.id}">${cat.title}</option>`;
        });
    }
    document.getElementById("tableBodyCategory").innerHTML = htmlCategoryTable;
    document.getElementById("form_select").innerHTML = htmlDropdownOptions;
    // Khoi 3: Ve bang lich su giao dich
    let htmlTransactionTable = "";
    const sortedTransactions = [...transactionsInMonth].sort((a, b) => new Date(b.date) - new Date(a.date));
    window.currentPage = window.currentPage || 1;
    const soDongmoitrang = 2;
    const tongSoTrang = Math.ceil(sortedTransactions.length / soDongmoitrang) || 1;
    if(window.currentPage > tongSoTrang) window.currentPage = tongSoTrang;
    const DiemBatDau = (window.currentPage -1) * soDongmoitrang;
    const top2Transactions = sortedTransactions.slice(DiemBatDau, DiemBatDau + soDongmoitrang);
    top2Transactions.forEach(tx => {
        const danhMucTuongUng = appData.categories.find(cat => cat.id === tx.categoryId);
        const tenDanhMuc = danhMucTuongUng ? danhMucTuongUng.title : "Chua phan loai";
        const classMauTien = tx.valueMoney > 0 ? "text-success font-bold" : "text-danger font-bold";
        const dauHienThi = tx.valueMoney > 0 ? "+" : "";
        const parts = tx.date.split("-");
        const dateDisplay = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : tx.date;
        htmlTransactionTable += `
            <tr>
                <td>${dateDisplay}</td>
                <td><span class="badge">${tenDanhMuc}</span></td>
                <td>${tx.note}</td>
                <td class="${classMauTien}">${dauHienThi}${tx.valueMoney.toLocaleString("vi-VN")} ₫</td>
                <td><button class="btn btn-danger" onclick="deleteTransaction(${tx.id})">Xoa</button></td>
            </tr>
        `;
    });
    document.getElementById("transactionHistoryBody").innerHTML = htmlTransactionTable;
    // Khoi 4: Ve bang tong hop chi tieu cac thang (Summary Table)
    const monthlyExpenses = {};
    appData.transactions.forEach(tx => {
        if (tx.valueMoney < 0) {
            const monthKey = tx.date.slice(0, 7);
            monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + Math.abs(tx.valueMoney);
        }
    });
    let htmlSummaryTable = "";
    const sortedMonths = Object.keys(monthlyExpenses).sort().reverse();
    if (sortedMonths.length === 0) {
        htmlSummaryTable = `<tr><td colspan="3" style="text-align: center; color: #888;">Chua co du lieu chi tieu.</td></tr>`;
    } else {
        sortedMonths.forEach(mKey => {
            const totalExp = monthlyExpenses[mKey];
            const parts = mKey.split("-");
            htmlSummaryTable += `
                <tr>
                    <td><strong>Thang ${parts[1]} / ${parts[0]}</strong></td>
                    <td class="text-danger font-bold">-${totalExp.toLocaleString("vi-VN")} ₫</td>
                    <td><span class="text-success font-bold">On dinh</span></td>
                </tr>
            `;
        });
    }
    document.getElementById("summaryTableBody").innerHTML = htmlSummaryTable;
} 
window.deleteCategory = function(catId) {
    const kiemTraGiaoDich = appData.transactions.some(tx => tx.categoryId === catId);
    if (kiemTraGiaoDich) {
        alert("Khong the xoa! Danh muc nay da co giao dich phat sinh trong lich su.");
        return;
    }
    if (confirm("Ban chac chan muon xoa danh muc nay?")) {
        appData.categories = appData.categories.filter(cat => cat.id !== catId);
        saveData(appData);
        console.log("deleteCategory completed - Categories Array:", appData.categories);
        renderUI();
    }
};
window.deleteTransaction = function(txId) {
    if (confirm("Ban co chac chan muon xoa giao dich nay khong?")) {
        appData.transactions = appData.transactions.filter(tx => tx.id !== txId);
        saveData(appData);
        console.log("deleteTransaction completed - Transactions Array:", appData.transactions);
        renderUI();
    }
};