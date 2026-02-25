lucide.createIcons();

const API_URL = "https://script.google.com/macros/s/AKfycbyzNaowGlzUAvsfX0DTnb98BiXM5JkYgK45po94lh2NPj-7rU41QZZ0BV3vBvMFltRFCw/exec";
const GITHUB_REPO = "sikumel-ux/makam"; // GANTI DENGAN REPO-MU

// 1. Navigation
function switchView(viewId, el) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(`view-${viewId}`).classList.add('active-view');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');

    if(viewId === 'home') fetchFiles();
}

// 2. Fetch Files
async function fetchFiles() {
    const listEl = document.getElementById('file-list');
    listEl.innerHTML = '<div style="text-align:center; padding:20px; font-size:12px;">Sinkronisasi...</div>';

    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/uploads`);
        const files = await res.json();

        if(!Array.isArray(files)) {
            listEl.innerHTML = '<p style="text-align:center; font-size:12px;">Belum ada file.</p>';
            return;
        }

        listEl.innerHTML = '';
        files.filter(f => f.name.endsWith('.pdf')).forEach(file => {
            const card = document.createElement('div');
            card.className = 'file-card';
            card.innerHTML = `
                <div style="color:#ef4444; font-size:24px;"><i class="fa-solid fa-file-pdf"></i></div>
                <div style="flex:1; overflow:hidden;">
                    <h4 style="margin:0; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${file.name}</h4>
                    <p style="margin:2px 0 0; font-size:10px; color:#94a3b8;">PDF Cloud File</p>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="btn-refresh" onclick="copyLink('${file.name}')"><i class="fa-solid fa-link"></i></button>
                    <button class="btn-refresh" onclick="deleteFile('${file.name}', '${file.sha}')" style="color:#ef4444"><i class="fa-solid fa-trash-can"></i></button>
                </div>`;
            listEl.appendChild(card);
        });
    } catch (e) {
        listEl.innerHTML = '<p>Koneksi bermasalah.</p>';
    }
}

// 3. Helper Functions
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function copyLink(name) {
    const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/uploads/${name}`;
    navigator.clipboard.writeText(url);
    showToast("Link disalin!");
}

async function deleteFile(name, sha) {
    if(!confirm("Hapus file ini?")) return;
    showToast("Menghapus...");
    try {
        await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "delete", name: name, sha: sha })
        });
        showToast("Terhapus!");
        fetchFiles();
    } catch (e) { showToast("Gagal hapus."); }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    switchView('home', document.querySelector('.nav-item'));
});
