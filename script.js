// 1. VARIABEL GLOBAL
let allData = [];
let filteredData = [];

// 2. FUNGSI PENDUKUNG
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '0';
    return parseInt(amount).toLocaleString('id-ID');
}

function sortDataByNewestDate(data) {
    return data.sort((a, b) => {
        const dateA = new Date(a.tanggal || 0);
        const dateB = new Date(b.tanggal || 0);
        return dateB - dateA; // Descending (newest first)
    });
}

// 3. FUNGSI UTAMA
async function loadData() {
    try {
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('table-container').style.display = 'none';
        
        const response = await fetch('https://script.google.com/macros/s/AKfycbxEBiFSKRL2dwBHExY4eaPorC_6FXxVqftP9qx1e1dwrUmemA-UsDUksBBIYpNLCpuBbQ/exec');
        const result = await response.json();
        
        if (result.status === 'success') {
            allData = sortDataByNewestDate(result.data);
            filteredData = [...allData];
            renderTable();
            updateTotal();
        } else {
            showAlert('Gagal memuat data: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        showAlert('Terjadi error: ' + error.message, 'error');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('table-container').style.display = 'block';
    }
}

function updateTotal() {
    const totalElement = document.getElementById('total');
    
    if (filteredData.length === 0) {
        totalElement.textContent = 'Total: 0 data';
        return;
    }
    
    // Hitung total berbagai jenis iuran
    const totals = filteredData.reduce((acc, item) => {
        acc.iuran_rw += parseInt(item.iuran_rw) || 0;
        acc.iuran_rt += parseInt(item.iuran_rt) || 0;
        acc.takziyah += parseInt(item.takziyah) || 0;
        acc.kas += parseInt(item.kas) || 0;
        acc.denda_kb += parseInt(item.denda_kb) || 0;
        acc.lain_lain += parseInt(item['lain_-_lain']) || 0;
        return acc;
    }, { iuran_rw: 0, iuran_rt: 0, takziyah: 0, kas: 0, denda_kb: 0, lain_lain: 0 });
    
    const grandTotal = totals.iuran_rw + totals.iuran_rt + totals.takziyah + totals.kas + totals.denda_kb + totals.lain_lain;
    
    totalElement.innerHTML = `
        <div><i class="fas fa-database"></i> Total Data: <strong>${filteredData.length}</strong></div>
        <div><i class="fas fa-home"></i> Iuran RW: <strong>Rp${formatCurrency(totals.iuran_rw)}</strong></div>
        <div><i class="fas fa-home"></i> Iuran RT: <strong>Rp${formatCurrency(totals.iuran_rt)}</strong></div>
        <div><i class="fas fa-hands-helping"></i> Takziyah: <strong>Rp${formatCurrency(totals.takziyah)}</strong></div>
        <div><i class="fas fa-piggy-bank"></i> Kas: <strong>Rp${formatCurrency(totals.kas)}</strong></div>
        <div><i class="fas fa-exclamation-circle"></i> Denda KB: <strong>Rp${formatCurrency(totals.denda_kb)}</strong></div>
        <div><i class="fas fa-ellipsis-h"></i> Lain-lain: <strong>Rp${formatCurrency(totals.lain_lain)}</strong></div>
        <div class="grand-total"><i class="fas fa-coins"></i> Grand Total: <strong>Rp${formatCurrency(grandTotal)}</strong></div>
    `;
}

function renderTable() {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="14" style="text-align: center;">Tidak ada data yang ditemukan</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        const lainLain = item['lain_-_lain'] || 0;
        const kas = item.kas || 0;
        const dendaKb = item.denda_kb || 0;
        const total = (parseInt(item.iuran_rw) || 0) + 
                     (parseInt(item.iuran_rt) || 0) + 
                     (parseInt(item.takziyah) || 0) + 
                     (parseInt(kas) || 0) +
                     (parseInt(dendaKb) || 0) +
                     (parseInt(lainLain) || 0);
        
        row.innerHTML = `
            <td style="width:80px;">${index + 1}</td>
            <td style="width:100px;">${item.blok_no || ''}</td>
            <td style="width:180px;">${item.nama || ''}</td>
            <td style="width:180px;">${item.jenis_iuran || ''}</td>
            <td style="width:180px;">${item.periode || ''}</td>
            <td style="width:180px;">${formatDate(item.tanggal)}</td>
            <td style="text-align: right; width:180px;">${formatCurrency(item.iuran_rw)}</td>
            <td style="text-align: right; width:180px;">${formatCurrency(item.iuran_rt)}</td>
            <td style="text-align: right; width:180px;">${formatCurrency(item.takziyah)}</td>
            <td style="text-align: right; width:180px;">${formatCurrency(kas)}</td>
            <td style="text-align: right; width:180px;">${formatCurrency(dendaKb)}</td>
            <td style="text-align: right; width:180px;">${formatCurrency(lainLain)}</td>
            <td style="text-align: right; font-weight: bold; color: var(--accent-color); width:180px;">${formatCurrency(total)}</td>
            <td >${item.keterangan || ''}</td>
        `;
        tableBody.appendChild(row);
    });
}

function showAlert(message, type = 'info') {
    // Implementasi alert yang lebih baik bisa ditambahkan di sini
    alert(message);
}

// 5. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Tambahkan event listener untuk refresh button
    document.getElementById('refresh-btn').addEventListener('click', loadData);
    
    // Tambahkan event listener untuk search
  //  document.getElementById('search-input').addEventListener('input', (e) => {
  //      const searchTerm = e.target.value.toLowerCase();
  //      if (searchTerm.trim() === '') {
  //          filteredData = [...allData];
  //      } else {
  //          filteredData = allData.filter(item => 
  //              (item.nama && item.nama.toLowerCase().includes(searchTerm)) ||
  //              (item.blok_no && item.blok_no.toLowerCase().includes(searchTerm))
  //          );
  //      }
  //      renderTable();
  //      updateTotal();
  //  });
});
