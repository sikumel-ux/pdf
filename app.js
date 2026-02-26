// === KONFIGURASI ===
const GITHUB_REPO = "sikumel-ux/pdf"; 
const API_URL = "https://script.google.com/macros/s/AKfycbyzNaowGlzUAvsfX0DTnb98BiXM5JkYgK45po94lh2NPj-7rU41QZZ0BV3vBvMFltRFCw/exec";

// === NAVIGASI (FIXED) ===
function switchTab(viewId, el) {
    // Sembunyikan semua view
    const views = document.querySelectorAll('.view');
    views.forEach(v => {
        v.classList.remove('active-view');
        v.style.display = 'none';
    });

    // Tampilkan view yang dipilih
    const target = document.getElementById('view-' + viewId);
    if(target) {
        target.classList.add('active-view');
        target.style.display = 'block';
    }

    // Update Nav Item
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    el.classList.add('active');

    // Jika ke home, refresh data
    if(viewId === 'home') fetchFiles();
}

// === AMBIL DATA ===
async function fetchFiles() {
    const list = document.getElementById('file-list');
    list.innerHTML = `<div style="text-align:center; padding:40px; color:var(--deep-blue);"><i class="fa-solid fa-circle-notch fa-spin fa-2x"></i><p style="margin-top:10px; font-size:12px; font-weight:700;">Menyinkronkan...</p></div>`;

    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/uploads`);
        const data = await res.json();
        
        if(!Array.isArray(data)) {
            list.innerHTML = '<div class="card" style="font-size:13px;">Belum ada file.</div>';
            return;
        }

        const pdfFiles = data.filter(f => f.name.toLowerCase().endsWith('.pdf'));
        let html = '<div class="file-table-container">';
        pdfFiles.forEach(f => {
            html += `
                <div class="file-row">
                    <div class="file-icon"><i class="fa-solid fa-file-pdf"></i></div>
                    <div class="file-info">
                        <span class="file-name">${f.name}</span>
                        <span class="file-meta">${(f.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div class="file-actions">
                        <button onclick="copyLink('${f.name}')" class="btn-action btn-copy"><i class="fa-solid fa-link"></i></button>
                        <button onclick="deleteFile('${f.name}', '${f.sha}')" class="btn-action btn-delete"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>`;
        });
        html += '</div>';
        list.innerHTML = (pdfFiles.length > 0) ? html : '<div class="card" style="font-size:13px;">Folder kosong.</div>';
    } catch (e) { list.innerHTML = '<div class="card">Gagal koneksi.</div>'; }
}

// === UPLOAD ===
const uploadBtn = document.getElementById('uploadBtn');
const pdfInput = document.getElementById('pdfInput');
const fileLabel = document.getElementById('file-label');

pdfInput.addEventListener('change', () => {
    if (pdfInput.files[0]) {
        fileLabel.innerText = pdfInput.files[0].name;
        fileLabel.style.color = "#053a6f";
    }
});

uploadBtn.addEventListener('click', async () => {
    const file = pdfInput.files[0];
    if (!file) return showToast("⚠️ Pilih file!");
    
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "upload", name: file.name, content: reader.result })
            });
            showToast("✅ Berhasil!");
            pdfInput.value = "";
            fileLabel.innerText = "Pilih file PDF";
            setTimeout(() => switchTab('home', document.querySelector('.nav-item')), 1500);
        } catch (e) { showToast("❌ Gagal."); }
        finally { 
            uploadBtn.disabled = false; 
            uploadBtn.innerHTML = '<span>MULAI UPLOAD</span> <i class="fa-solid fa-arrow-right-long"></i>'; 
        }
    };
    reader.readAsDataURL(file);
});

// === DELETE & COPY ===
async function deleteFile(name, sha) {
    if(!confirm(`Hapus ${name}?`)) return;
    showToast("Menghapus...");
    try {
        await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "delete", name: name, sha: sha }) });
        showToast("🗑️ Terhapus!");
        fetchFiles();
    } catch (e) { showToast("❌ Error."); }
}

function copyLink(name) {
    const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/uploads/${name}`;
    navigator.clipboard.writeText(url);
    showToast("🔗 Link disalin!");
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// Start
document.addEventListener('DOMContentLoaded', fetchFiles);
                
