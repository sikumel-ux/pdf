const GITHUB_REPO = "sikumel-ux/pdf"; 
const API_URL = "https://script.google.com/macros/s/AKfycbxmYhZ-5C74fQaLMkAgEMjaXTiJiFzMKyzfR0MN6RTkajXWjXyXywvTft8k9S-w32CZ/exec";
const MY_DOMAIN = "https://files.mahikatrans.my.id";

let allFiles = [];

// Memuat data dari GitHub API
async function fetchFiles() {
    const list = document.getElementById('file-list');
    list.innerHTML = `<div style="text-align:center;padding:30px;"><i class="fa-solid fa-circle-notch fa-spin fa-2x" style="color:var(--primary)"></i></div>`;
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/uploads?t=${Date.now()}`);
        const data = await res.json();
        allFiles = Array.isArray(data) ? data : [];
        renderFiles(allFiles);
    } catch (e) { 
        list.innerHTML = '<p style="text-align:center;color:red;font-size:12px;">Gagal memuat data.</p>'; 
    }
}

// Menampilkan daftar file ke UI
function renderFiles(files) {
    const list = document.getElementById('file-list');
    list.innerHTML = files.map(f => {
        let icon = 'fa-file-lines';
        const n = f.name.toLowerCase();
        if(n.endsWith('.pdf')) icon = 'fa-file-pdf';
        else if(n.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) icon = 'fa-file-image';
        else if(n.match(/\.(xlsx|xls|csv)$/)) icon = 'fa-file-excel';
        else if(n.match(/\.(docx|doc)$/)) icon = 'fa-file-word';

        return `
        <div class="file-row">
            <i class="fa-solid ${icon}" style="color:var(--primary); font-size:20px;"></i>
            <div class="file-info">
                <span class="file-name">${f.name}</span>
                <span class="file-meta">${(f.size/1024).toFixed(1)} KB</span>
            </div>
            <div class="file-actions">
                <button onclick="copyLink('${f.name}')" class="btn-action btn-copy" title="Salin Link"><i class="fa-solid fa-link"></i></button>
                <button onclick="deleteFile('${f.name}', '${f.sha}')" class="btn-action btn-delete" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>`;
    }).join('') || '<p style="text-align:center;font-size:12px;color:#94a3b8;padding:20px;">Cloud kosong.</p>';
}

function copyLink(name) {
    const url = `${MY_DOMAIN}/uploads/${name}`.replace(/([^:]\/)\/+/g, "$1");
    navigator.clipboard.writeText(url).then(() => showToast("🔗 Link Berhasil Disalin!"));
}

function toggleUpload() {
    const h = document.getElementById('home-view'), u = document.getElementById('upload-view');
    const btn = document.getElementById('btnToggle');
    const isHome = h.style.display !== 'none';
    
    h.style.display = isHome ? 'none' : 'block';
    u.style.display = isHome ? 'block' : 'none';
    btn.innerText = isHome ? "[ Kembali ke Dashboard ]" : "[ Panel Upload ]";
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// Event Listener saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn'), fileInput = document.getElementById('fileInput');
    
    if(fileInput) {
        fileInput.onchange = () => { 
            if(fileInput.files[0]) document.getElementById('file-label').innerText = fileInput.files[0].name; 
        };
    }

    if(uploadBtn) {
        uploadBtn.onclick = async () => {
            const file = fileInput.files[0]; 
            if(!file) return showToast("⚠️ Pilih file dulu!");
            
            uploadBtn.innerText = "MENGIRIM..."; uploadBtn.disabled = true;
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    await fetch(API_URL, { 
                        method: "POST", 
                        body: JSON.stringify({ action: "upload", name: file.name, content: reader.result.split(',')[1] }) 
                    });
                    showToast("✅ Berhasil Diupload!");
                    setTimeout(() => location.reload(), 1500);
                } catch (err) {
                    showToast("❌ Gagal Upload!");
                    uploadBtn.innerText = "UPLOAD KE CLOUD"; uploadBtn.disabled = false;
                }
            };
            reader.readAsDataURL(file);
        };
    }
    fetchFiles();
});

async function deleteFile(n, s) { 
    if(confirm(`Hapus file ${n}?`)) { 
        showToast("Menghapus...");
        await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "delete", name: n, sha: s }) }); 
        fetchFiles(); 
        showToast("🗑️ Terhapus!");
    } 
}

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    renderFiles(allFiles.filter(f => f.name.toLowerCase().includes(keyword)));
});
