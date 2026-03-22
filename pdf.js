const API_URL = "https://script.google.com/macros/s/AKfycbzqq0Q5nGjgtDMlI_36LS67gylqT_S0ZlWjT1oqSvHFapbR2P_J7UdhwDDtbJKH4lKcmg/exec";

let db = [];

async function load() {
    const list = document.getElementById('f-list');
    list.innerHTML = `<p style="text-align:center;padding:20px;font-size:12px;">Menghubungkan...</p>`;
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "list" }) });
        db = await res.json();
        render(db);
    } catch (e) { list.innerHTML = '<p style="text-align:center;color:red;">Koneksi Gagal.</p>'; }
}

function render(data) {
    const list = document.getElementById('f-list');
    list.innerHTML = data.map(f => `
        <div class="f-item" style="display:flex; align-items:center; padding:12px; border-bottom:1px solid #f1f5f9; gap:10px;">
            <i class="fa-solid fa-file-invoice" style="color:#0066ff"></i>
            <div style="flex:1; min-width:0;">
                <b style="font-size:13px; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.name}</b>
                <small style="color:#888; font-size:10px;">${(f.size/1024).toFixed(1)} KB</small>
            </div>
            <div style="display:flex; gap:5px;">
                <button onclick="ren('${f.id}', '${f.name}')" style="border:none; background:#eee; padding:8px; border-radius:5px; cursor:pointer;"><i class="fa-solid fa-pen"></i></button>
                <button onclick="del('${f.id}', '${f.name}')" style="border:none; background:#eee; padding:8px; border-radius:5px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`).join('') || '<p style="text-align:center;padding:20px;font-size:12px;color:#999;">Folder Kosong.</p>';
}

async function ren(id, old) {
    const n = prompt("Nama baru:", old);
    if (!n || n === old) return;
    msg("Mengubah...");
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "rename", id, newName: n }) });
    load(); msg("Berhasil!");
}

async function del(id, name) {
    if (confirm(`Hapus ${name}?`)) {
        msg("Menghapus...");
        await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "delete", id }) });
        load(); msg("Terhapus!");
    }
}

function toggleV() {
    const l = document.getElementById('v-list'), u = document.getElementById('v-up'), b = document.getElementById('btnT');
    const isL = l.style.display !== 'none';
    l.style.display = isL ? 'none' : 'block';
    u.style.display = isL ? 'block' : 'none';
    b.innerText = isL ? "[ Kembali ke List ]" : "[ Panel Upload ]";
}

function msg(m) {
    const t = document.getElementById('toast');
    t.innerText = m; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const bU = document.getElementById('btnU'), fI = document.getElementById('fileI');
    fI.onchange = () => { if(fI.files[0]) document.getElementById('l-file').innerText = fI.files[0].name; };
    bU.onclick = async () => {
        const file = fI.files[0]; if(!file) return msg("Pilih file!");
        bU.innerText = "MENGIRIM..."; bU.disabled = true;
        const reader = new FileReader();
        reader.onload = async () => {
            const content = reader.result.split(',')[1];
            await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "upload", name: file.name, content, type: file.type }) });
            msg("Sukses!"); 
            setTimeout(() => location.reload(), 1000);
        };
        reader.readAsDataURL(file);
    };
    load();
});

document.getElementById('sInp').oninput = (e) => {
    const k = e.target.value.toLowerCase();
    render(db.filter(f => f.name.toLowerCase().includes(k)));
};
               
