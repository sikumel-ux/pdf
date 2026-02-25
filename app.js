lucide.createIcons();

const API_URL = "https://script.google.com/macros/s/AKfycbyzNaowGlzUAvsfX0DTnb98BiXM5JkYgK45po94lh2NPj-7rU41QZZ0BV3vBvMFltRFCw/exec";
const GITHUB_REPO = "sikumel-ux/makam"; // GANTI INI

// 1. Navigation Logic
function switchView(viewId, el) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-${viewId}`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');

    if(viewId === 'home') fetchFiles();
}

// 2. Fetch Files from GitHub
async function fetchFiles() {
    const listEl = document.getElementById('file-list');
    listEl.innerHTML = '<div class="loading-state">Sinkronisasi cloud...</div>';

    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/uploads`);
        const files = await res.json();

        if(!Array.isArray(files)) {
            listEl.innerHTML = '<p style="text-align:center">Belum ada file.</p>';
            return;
        }

        listEl.innerHTML = '';
        files.filter(f => f.name.endsWith('.pdf')).forEach(file => {
            const card = document.createElement('div');
            card.className = 'file-card';
            card.innerHTML = `
                <div class="file-icon"><i class="fa-solid fa-file-pdf"></i></div>
                <div class="file-info">
                    <h4>${file.name}</h4>
                    <p>${(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div class="file-actions">
                    <button class="btn-icon" onclick="copyLink('${file.name}')"><i class="fa-solid fa-link"></i></button>
                    <button class="btn-icon" onclick="deleteFile('${file.name}', '${file.sha}')" style="color:#ef4444"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            listEl.appendChild(card);
        });
    } catch (e) {
        listEl.innerHTML = '<p>Gagal memuat file.</p>';
    }
}

// 3. Delete File
async function deleteFile(name, sha) {
    if(!confirm(`Hapus permanen ${name}?`)) return;
    
    showToast("Menghapus file...");
    try {
        await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "delete", name: name, sha: sha })
        });
        showToast("File terhapus!");
        fetchFiles();
    } catch (e) {
        showToast("Gagal menghapus.");
    }
}

// 4. Copy Link
function copyLink(name) {
    const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/uploads/${name}`;
    navigator.clipboard.writeText(url);
    showToast("Link disalin!");
}

// 5. Toast System
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// Inisialisasi awal
fetchFiles();
