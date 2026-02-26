// === API CONFIGURATION ===
// Sudah diupdate ke repo: sikumel-ux/pdf
const GITHUB_REPO = "sikumel-ux/pdf"; 
const API_URL = "https://script.google.com/macros/s/AKfycbyzNaowGlzUAvsfX0DTnb98BiXM5JkYgK45po94lh2NPj-7rU41QZZ0BV3vBvMFltRFCw/exec";

// === NAVIGATION ===
function switchTab(viewId, el) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active-view');
        v.style.display = 'none';
    });
    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) {
        activeView.classList.add('active-view');
        activeView.style.display = 'block';
    }
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    
    // Refresh list jika balik ke home
    if(viewId === 'home') fetchFiles();
}

// === LOAD DATA (MODERN TABLE) ===
async function fetchFiles() {
    const list = document.getElementById('file-list');
    list.innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--deep-blue);">
            <i class="fa-solid fa-circle-notch fa-spin fa-2x"></i>
            <p style="margin-top:10px; font-size:12px; font-weight:700;">Menyinkronkan Cloud...</p>
        </div>`;

    try {
        // Mengambil data dari repo sikumel-ux/pdf folder uploads
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/uploads`);
        const data = await res.json();
        
        if(!Array.isArray(data)) {
            list.innerHTML = '<div class="card" style="font-size:13px; color:#64748b;">Belum ada dokumen di folder uploads.</div>';
            return;
        }

        const pdfFiles = data.filter(f => f.name.toLowerCase().endsWith('.pdf'));
        
        if(pdfFiles.length === 0) {
            list.innerHTML = '<div class="card" style="font-size:13px; color:#64748b;">Folder kosong, ayo upload file pertama!</div>';
            return;
        }

        let html = '<div class="file-table-container">';
        pdfFiles.forEach(f => {
            html += `
                <div class="file-row">
                    <div class="file-icon"><i class="fa-solid fa-file-pdf"></i></div>
                    <div class="file-info">
                        <span class="file-name">${f.name}</span>
                        <span class="file-meta">${(f.size / 1024).toFixed(1)} KB • PDF Cloud</span>
                    </div>
                    <div class="file-actions">
                        <button onclick="copyLink('${f.name}')" class="btn-action btn-copy" title="Salin Link">
                            <i class="fa-solid fa-link"></i>
                        </button>
                        <button onclick="deleteFile('${f.name}', '${f.sha}')" class="btn-action btn-delete" title="Hapus File">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>`;
        });
        html += '</div>';
        list.innerHTML = html;
    } catch (e) { 
        list.innerHTML = '<div class="card" style="color:#ef4444;">Gagal terhubung ke GitHub. Cek folder "uploads" di repo kamu.</div>'; 
    }
}

// === ACTION UPLOAD ===
const uploadBtn = document.getElementById('uploadBtn');
const pdfInput = document.getElementById('pdfInput');
const fileLabel = document.getElementById('file-label');

if (pdfInput) {
    pdfInput.addEventListener('change', () => {
        if (pdfInput.files[0]) {
            fileLabel.innerText = pdfInput.files[0].name;
            fileLabel.style.color = "#053a6f";
        }
    });
}

if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
        const file = pdfInput.files[0];
        if (!file) return showToast("⚠️ Pilih file PDF dulu!");
        
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> MENGIRIM...';
        
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    body: JSON.stringify({ action: "upload", name: file.name, content: reader.result })
                });
                
                showToast("✅ Berhasil disimpan ke Cloud!");
                pdfInput.value = "";
                fileLabel.innerText = "Pilih file PDF untuk diupload";
                // Otomatis pindah ke home setelah berhasil
                setTimeout(() => switchTab('home', document.querySelector('.nav-item')), 1500);
            } catch (e) { 
                showToast("❌ Gagal upload."); 
            } finally { 
                uploadBtn.disabled = false; 
                uploadBtn.innerHTML = '<span>MULAI UPLOAD</span> <i class="fa-solid fa-arrow-right-long"></i>'; 
            }
        };
        reader.readAsDataURL(file);
    });
}

// === ACTION DELETE ===
async function deleteFile(name, sha) {
    if(!confirm(`Hapus permanen file ini?\n"${name}"`)) return;
    
    showToast("Menghapus...");
    try {
        await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify({ action: "delete", name: name, sha: sha }) 
        });
        showToast("🗑️ File berhasil dihapus!");
        fetchFiles(); // Refresh list
    } catch (e) { 
        showToast("❌ Gagal menghapus."); 
    }
}

// === UTILITY ===
function copyLink(name) {
    const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/uploads/${name}`;
    navigator.clipboard.writeText(url);
    showToast("🔗 Link berhasil disalin!");
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if (t) {
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }
}

// Jalankan load awal
document.addEventListener('DOMContentLoaded', fetchFiles);
            
