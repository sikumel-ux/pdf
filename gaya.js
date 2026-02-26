// Konfigurasi Repo & API
const GITHUB_REPO = "sikumel-ux/pdf"; 
const API_URL = "https://script.google.com/macros/s/AKfycbyzNaowGlzUAvsfX0DTnb98BiXM5JkYgK45po94lh2NPj-7rU41QZZ0BV3vBvMFltRFCw/exec";
const MY_DOMAIN = "https://files.mahikatrans.my.id/uploads";

let allFiles = []; // Cache untuk fitur pencarian

// 1. Fungsi Navigasi Tab
function switchTab(viewId, el) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    const target = document.getElementById('view-' + viewId);
    if(target) target.classList.add('active-view');

    // Update warna icon di nav bawah
    document.querySelectorAll('.nav-item').forEach(nav => nav.style.color = '#94a3b8');
    el.style.color = '#053a6f';

    if(viewId === 'home') fetchFiles();
}

// 2. Fungsi Ambil Data File dari GitHub
async function fetchFiles() {
    const list = document.getElementById('file-list');
    list.innerHTML = `
        <div style="text-align:center; padding:30px;">
            <i class="fa-solid fa-circle-notch fa-spin fa-2x" style="color:var(--deep-blue)"></i>
            <p style="font-size:12px; margin-top:10px; font-weight:700;">Menghubungkan...</p>
        </div>`;

    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/uploads?t=${Date.now()}`);
        const data = await res.json();
        
        if(!Array.isArray(data)) {
            list.innerHTML = '<p style="text-align:center; font-size:12px; color:#94a3b8;">Belum ada dokumen.</p>';
            return;
        }

        // Simpan ke variabel global untuk filter pencarian
        allFiles = data.filter(f => f.name.toLowerCase().endsWith('.pdf'));
        renderFiles(allFiles);

    } catch (e) {
        list.innerHTML = '<p style="text-align:center; font-size:12px; color:red;">Gagal memuat file.</p>';
    }
}

// 3. Fungsi Render List File ke HTML
function renderFiles(files) {
    const list = document.getElementById('file-list');
    if(files.length === 0) {
        list.innerHTML = '<p style="text-align:center; font-size:12px; color:#94a3b8; padding:20px;">File tidak ditemukan.</p>';
        return;
    }

    let html = '';
    files.forEach(f => {
        html += `
            <div class="file-row">
                <div class="file-info">
                    <span class="file-name">${f.name}</span>
                    <span class="file-meta">${(f.size / 1024).toFixed(1)} KB • PDF</span>
                </div>
                <div class="file-actions">
                    <button onclick="copyLink('${f.name}')" class="btn-action btn-copy" title="Salin Link">
                        <i class="fa-solid fa-link"></i>
                    </button>
                    <button onclick="deleteFile('${f.name}', '${f.sha}')" class="btn-action btn-delete" title="Hapus">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>`;
    });
    list.innerHTML = html;
}

// 4. Fitur Pencarian Otomatis
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = allFiles.filter(f => f.name.toLowerCase().includes(keyword));
    renderFiles(filtered);
});

// 5. Fungsi Salin Link (Menggunakan Domain Sendiri)
function copyLink(name) {
    const url = `${MY_DOMAIN}/uploads/${name}`;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(() => showToast("🔗 Link Berhasil Disalin!"));
    } else {
        // Fallback untuk browser lama atau non-HTTPS
        let textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast("🔗 Link Berhasil Disalin!");
        } catch (err) {
            showToast("❌ Gagal menyalin link.");
        }
        document.body.removeChild(textArea);
    }
}

// 6. Fungsi Upload File
document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const pdfInput = document.getElementById('pdfInput');
    const fileLabel = document.getElementById('file-label');

    if(pdfInput) {
        pdfInput.onchange = () => {
            if(pdfInput.files[0]) fileLabel.innerText = pdfInput.files[0].name;
        };
    }

    if(uploadBtn) {
        uploadBtn.onclick = async () => {
            const file = pdfInput.files[0];
            if(!file) return showToast("⚠️ Pilih file PDF dulu!");
            
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> PROSES UPLOAD...';

            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const response = await fetch(API_URL, {
                        method: "POST",
                        body: JSON.stringify({ 
                            action: "upload", 
                            name: file.name, 
                            content: reader.result.split(',')[1] 
                        })
                    });
                    const res = await response.json();
                    
                    if(res.status === "success") {
                        showToast("✅ File Berhasil Tersimpan!");
                        pdfInput.value = "";
                        fileLabel.innerText = "Ketuk untuk pilih file";
                        setTimeout(() => switchTab('home', document.querySelector('.nav-item')), 1000);
                    } else {
                        showToast("❌ Gagal: " + res.message);
                    }
                } catch (e) {
                    showToast("❌ Gagal terhubung ke API.");
                } finally {
                    uploadBtn.disabled = false;
                    uploadBtn.innerHTML = 'UPLOAD KE CLOUD';
                }
            };
            reader.readAsDataURL(file);
        };
    }
    
    // Load file saat pertama kali buka
    fetchFiles();
});

// 7. Fungsi Hapus File
async function deleteFile(name, sha) {
    if(!confirm(`Hapus permanen file: ${name}?`)) return;
    
    showToast("Menghapus file...");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "delete", name: name, sha: sha })
        });
        const res = await response.json();
        if(res.status === "success") {
            showToast("🗑️ File Telah Dihapus!");
            fetchFiles(); // Refresh list
        } else {
            showToast("❌ Gagal menghapus.");
        }
    } catch (e) {
        showToast("❌ Gangguan koneksi.");
    }
}

// 8. Fungsi Toast Notifikasi
function showToast(msg) {
    const t = document.getElementById('toast');
    if(!t) return;
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
    }
    
