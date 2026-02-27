const GITHUB_REPO = "sikumel-ux/pdf"; 
const API_URL = "https://script.google.com/macros/s/AKfycbyzNaowGlzUAvsfX0DTnb98BiXM5JkYgK45po94lh2NPj-7rU41QZZ0BV3vBvMFltRFCw/exec";
const MY_DOMAIN = "https://files.mahikatrans.my.id";

let allFiles = [];

async function fetchFiles() {
    const list = document.getElementById('file-list');
    list.innerHTML = `<div style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--deep-blue)"></i></div>`;
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/uploads?t=${Date.now()}`);
        const data = await res.json();
        allFiles = Array.isArray(data) ? data.filter(f => f.name.toLowerCase().endsWith('.pdf')) : [];
        renderFiles(allFiles);
    } catch (e) { list.innerHTML = '<p>Gagal muat file.</p>'; }
}

function renderFiles(files) {
    const list = document.getElementById('file-list');
    list.innerHTML = files.map(f => `
        <div class="file-row">
            <div class="file-info">
                <span class="file-name">${f.name}</span>
                <span class="file-meta">${(f.size / 1024).toFixed(1)} KB</span>
            </div>
            <div class="file-actions">
                <button onclick="copyLink('${f.name}')" class="btn-action btn-copy"><i class="fa-solid fa-link"></i></button>
                <button onclick="deleteFile('${f.name}', '${f.sha}')" class="btn-action btn-delete"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>`).join('') || '<p style="text-align:center;font-size:12px;color:#94a3b8;">Kosong.</p>';
}

function copyLink(name) {
    const url = `${MY_DOMAIN}/uploads/${name}`.replace(/([^:]\/)\/+/g, "$1");
    navigator.clipboard.writeText(url).then(() => showToast("🔗 Tersalin!"));
}

function toggleUpload() {
    const h = document.getElementById('home-view');
    const u = document.getElementById('upload-view');
    const isHome = h.style.display !== 'none';
    h.style.display = isHome ? 'none' : 'block';
    u.style.display = isHome ? 'block' : 'none';
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    renderFiles(allFiles.filter(f => f.name.toLowerCase().includes(keyword)));
});

// Logic Upload
document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const pdfInput = document.getElementById('pdfInput');
    
    uploadBtn.onclick = async () => {
        if(!pdfInput.files[0]) return showToast("⚠️ Pilih file!");
        uploadBtn.disabled = true;
        uploadBtn.innerText = "UPLOADING...";
        const reader = new FileReader();
        reader.onload = async () => {
            const res = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "upload", name: pdfInput.files[0].name, content: reader.result.split(',')[1] })
            });
            showToast("✅ Berhasil!");
            setTimeout(() => location.reload(), 1500);
        };
        reader.readAsDataURL(pdfInput.files[0]);
    };
    fetchFiles();
});

async function deleteFile(n, s) {
    if(!confirm('Hapus?')) return;
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "delete", name: n, sha: s }) });
    fetchFiles();
}
