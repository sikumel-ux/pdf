const GITHUB_REPO = "sikumel-ux/mahika-repo"; // GANTI INI

function switchTab(viewId, el) {
    // Sembunyikan SEMUA view tanpa terkecuali
    const allViews = document.querySelectorAll('.view');
    allViews.forEach(v => {
        v.classList.remove('active-view');
        v.style.display = 'none';
    });

    // Tampilkan yang dipilih
    const activeView = document.getElementById(`view-${viewId}`);
    activeView.classList.add('active-view');
    activeView.style.display = 'block';
    
    // Warna nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');

    if(viewId === 'home') fetchFiles();
}

async function fetchFiles() {
    const list = document.getElementById('file-list');
    list.innerHTML = '<div class="loading-state">Sinkronisasi...</div>';

    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/uploads`);
        const data = await res.json();

        if(!Array.isArray(data)) {
            list.innerHTML = '<p style="text-align:center; padding:20px;">Belum ada file.</p>';
            return;
        }

        list.innerHTML = '';
        data.filter(f => f.name.endsWith('.pdf')).forEach(f => {
            const item = document.createElement('div');
            item.className = 'file-card';
            item.innerHTML = `
                <i class="fa-solid fa-file-pdf" style="color:#ef4444; font-size:20px;"></i>
                <div style="flex:1; overflow:hidden;">
                    <p style="font-size:12px; font-weight:700; overflow:hidden; text-overflow:ellipsis;">${f.name}</p>
                </div>
                <button onclick="copyLink('${f.name}')" style="border:none; background:none; padding:5px;"><i class="fa-solid fa-link"></i></button>
            `;
            list.appendChild(item);
        });
    } catch (e) {
        list.innerHTML = 'Gagal memuat.';
    }
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 2000);
}

function copyLink(name) {
    const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/uploads/${name}`;
    navigator.clipboard.writeText(url);
    showToast("Link disalin!");
}

// Jalankan fetch saat pertama buka
fetchFiles();
