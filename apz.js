const GITHUB_REPO = "sikumel-ux/pdf"; 
const API_URL = "https://script.google.com/macros/s/AKfycb...MASUKKAN_URL_BARU_DISINI.../exec";
const MY_DOMAIN = "https://files.mahikatrans.my.id";

let allFiles = [];

async function fetchFiles() {
    const list = document.getElementById('file-list');
    list.innerHTML = `<p style="text-align:center;padding:20px;font-size:12px;">Memuat data...</p>`;
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/uploads?t=${Date.now()}`);
        const data = await res.json();
        allFiles = Array.isArray(data) ? data : [];
        renderFiles(allFiles);
    } catch (e) { list.innerHTML = '<p style="text-align:center;color:red;">Gagal muat.</p>'; }
}

function renderFiles(files) {
    const list = document.getElementById('file-list');
    list.innerHTML = files.map(f => `
        <div class="file-row">
            <i class="fa-solid fa-file-lines" style="color:var(--primary)"></i>
            <div class="file-info">
                <span class="file-name">${f.name}</span>
                <span class="file-meta">${(f.size/1024).toFixed(1)} KB</span>
            </div>
            <div style="display:flex;gap:5px;">
                <button onclick="copyLink('${f.name}')" class="btn-action"><i class="fa-solid fa-link"></i></button>
                <button onclick="triggerRename('${f.name}', '${f.sha}')" class="btn-action"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteFile('${f.name}', '${f.sha}')" class="btn-action"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`).join('') || '<p style="text-align:center;font-size:12px;padding:20px;">Kosong.</p>';
}

function copyLink(n) {
    const url = `${MY_DOMAIN}/uploads/${n}`;
    navigator.clipboard.writeText(url).then(() => showToast("🔗 Link disalin!"));
}

async function triggerRename(oldName, sha) {
    const newName = prompt("Nama file baru:", oldName);
    if (!newName || newName === oldName) return;
    showToast("Mengubah nama...");
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/uploads/${oldName}`);
    const fileData = await res.json();
    await sendRequest({ action: "rename", oldName, newName, sha, content: fileData.content });
    showToast("✅ Berhasil!");
    fetchFiles();
}

async function deleteFile(n, s) {
    if (confirm(`Hapus ${n}?`)) {
        showToast("Menghapus...");
        await sendRequest({ action: "delete", name: n, sha: s });
        fetchFiles();
    }
}

async function sendRequest(body) {
    return fetch(API_URL, { method: "POST", body: JSON.stringify(body) });
}

function toggleUpload() {
    const h = document.getElementById('home-view'), u = document.getElementById('upload-view'), btn = document.getElementById('btnT');
    const isH = h.style.display !== 'none';
    h.style.display = isH ? 'none' : 'block';
    u.style.display = isH ? 'block' : 'none';
    btn.innerText = isH ? "[ Kembali ]" : "[ Panel Upload ]";
}

function showToast(m) {
    const t = document.getElementById('toast');
    t.innerText = m; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const upBtn = document.getElementById('uploadBtn'), fIn = document.getElementById('fileInput');
    fIn.onchange = () => { if(fIn.files[0]) document.getElementById('file-label').innerText = fIn.files[0].name; };
    upBtn.onclick = async () => {
        const file = fIn.files[0]; if(!file) return showToast("⚠️ Pilih file!");
        upBtn.innerText = "MENGIRIM..."; upBtn.disabled = true;
        const reader = new FileReader();
        reader.onload = async () => {
            await sendRequest({ action: "upload", name: file.name, content: reader.result.split(',')[1] });
            showToast("✅ Sukses!");
            setTimeout(() => location.reload(), 1000);
        };
        reader.readAsDataURL(file);
    };
    fetchFiles();
});

document.getElementById('searchInput').oninput = (e) => {
    const k = e.target.value.toLowerCase();
    renderFiles(allFiles.filter(f => f.name.toLowerCase().includes(k)));
};
                       
