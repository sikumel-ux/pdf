// URL Web App GAS yang Anda berikan tadi
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyuXszMGtTv_xFF1WfJiSk2zSGNLQjblYXdOnEE22PNEXtLs5lGAxYVlZjbMDIFtnrqjg/exec";

// Element Selector
const pdfInput = document.getElementById('pdfInput');
const fileLabel = document.getElementById('file-label');
const uploadBtn = document.getElementById('uploadBtn');
const toast = document.getElementById('toast');

// Update label saat file dipilih
pdfInput.addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        fileLabel.innerText = "File terpilih: " + this.files[0].name;
        fileLabel.style.color = "#053a6f";
    }
});

// Fungsi Utama Upload
async function uploadToCloud() {
    if (pdfInput.files.length === 0) {
        showToast("Pilih file PDF dulu, Bos!", "error");
        return;
    }

    const file = pdfInput.files[0];
    
    // Validasi hanya PDF (Opsional tapi disarankan)
    if (file.type !== "application/pdf") {
        showToast("Hanya file PDF yang diizinkan!", "error");
        return;
    }

    // Persiapan UI Loading
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> MENGUPLOAD...';
    showToast("Sedang memproses file...", "info");

    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64Data = e.target.result;
        const payload = {
            base64: base64Data,
            fileName: file.name
        };

        try {
            // Mengirim ke GAS
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors", // Gunakan no-cors untuk bypass CORS policy Google
                body: JSON.stringify(payload)
            });

            // Karena no-cors, kita asumsikan sukses jika tidak masuk ke catch
            showToast("Sukses! File masuk ke Drive.", "success");
            resetForm();
        } catch (error) {
            showToast("Gagal upload: " + error.message, "error");
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = "UPLOAD KE CLOUD";
        }
    };

    reader.readAsDataURL(file);
}

// Event Listener Tombol
uploadBtn.addEventListener('click', uploadToCloud);

// Fungsi Reset & Toast
function resetForm() {
    pdfInput.value = "";
    fileLabel.innerText = "Ketuk pilih PDF";
}

function showToast(message, type) {
    toast.innerText = message;
    toast.style.display = "block";
    toast.style.background = type === "success" ? "#28a745" : (type === "error" ? "#dc3545" : "#053a6f");
    
    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

// Tambahan: Logika ganti view (jika Anda ingin navigasi)
// Anda bisa memanggil ini melalui konsol atau tombol navigasi nantinya
function switchView(viewName) {
    document.getElementById('home-view').style.display = viewName === 'home' ? 'block' : 'none';
    document.getElementById('upload-view').style.display = viewName === 'upload' ? 'block' : 'none';
}

// Default: Tampilkan view upload agar Anda bisa langsung tes
switchView('upload');
