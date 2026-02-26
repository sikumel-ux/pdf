function copyLink(name) {
    const url = `https://files.mahikatrans.my.id/uploads/${name}`;
    navigator.clipboard.writeText(url);
    showToast("🔗 Link Berhasil Disalin!");
}

function switchTab(viewId, el) {
    // Sembunyikan semua view
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    // Munculkan yang diklik
    document.getElementById('view-' + viewId).style.display = 'block';
    
    // Reset warna nav
    document.querySelectorAll('.nav-item').forEach(nav => nav.style.color = '#94a3b8');
    el.style.color = '#053a6f';
    
    if(viewId === 'home') fetchFiles();
}
