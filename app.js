lucide.createIcons();

const API_URL = "https://script.google.com/macros/s/AKfycbyzNaowGlzUAvsfX0DTnb98BiXM5JkYgK45po94lh2NPj-7rU41QZZ0BV3vBvMFltRFCw/exec";
const GITHUB_USER = "sikumel-ux";
const GITHUB_REPO = "makam";

const pdfInput = document.getElementById('pdfInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileLabel = document.getElementById('file-label');
const resultBox = document.getElementById('resultBox');
const doneName = document.getElementById('doneName');
const copyBtn = document.getElementById('copyBtn');

let lastUrl = "";

// Update label saat file dipilih
pdfInput.addEventListener('change', () => {
    if (pdfInput.files[0]) {
        fileLabel.innerText = pdfInput.files[0].name;
        fileLabel.style.color = "var(--success)";
    }
});

// Proses Upload
uploadBtn.addEventListener('click', async () => {
    const file = pdfInput.files[0];
    if (!file) return alert("Pilih file dulu, Bro!");

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i data-lucide="loader-2" class="spinning"></i> Mengirim...';
    lucide.createIcons();

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    name: file.name,
                    content: reader.result,
                    action: "upload"
                })
            });

            const data = await response.json();
            if (data.content) {
                resultBox.style.display = 'block';
                doneName.innerText = file.name;
                uploadBtn.style.display = 'none';
                lastUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/uploads/${file.name}`;
            }
        } catch (e) {
            alert("Upload Gagal!");
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i data-lucide="send"></i> UPLOAD KE SERVER';
            lucide.createIcons();
        }
    };
    reader.readAsDataURL(file);
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(lastUrl);
    alert("Link disalin!");
});
