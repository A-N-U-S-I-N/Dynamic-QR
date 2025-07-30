document.addEventListener('DOMContentLoaded', () => {
  // Grab all customization inputs/buttons by id
  const colorInput = document.getElementById('qrColor');
  const shapeSelect = document.getElementById('qrShape');
  const titleInput = document.getElementById('qrTitle');
  const uploadBtn = document.getElementById('uploadLogoBtn');
  const qrContainer = document.getElementById('qrcode');
  const downloadBtn = document.getElementById('downloadQR');

  let qrCode = null;
  let logoDataUrl = null;
  let qrData = "";

  // Helper: Render QR on custom canvas with title on top
  function renderQRCodeWithTitle(qrImageBlob) {
    const qrSize = 200;
    const border = 8;
    const titleHeight = titleInput.value.trim() !== "" ? 30 : 0;
    const canvas = document.createElement('canvas');
    canvas.width = qrSize + border * 2;
    canvas.height = qrSize + border * 2 + titleHeight;
    const ctx = canvas.getContext('2d');
    // White background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title text
    if (titleHeight > 0) {
      ctx.fillStyle = '#111';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(titleInput.value.trim(), canvas.width / 2, 10);
    }

    // Draw QR image after it loads
    const qrImg = new window.Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, border, titleHeight + border, qrSize, qrSize);
      qrContainer.appendChild(canvas);
    };
    qrImg.src = URL.createObjectURL(qrImageBlob);

    // Also save for downloads
    canvas.className = "qr-final-canvas rounded";
  }

  // Core QR rendering function
  function renderQRCode() {
    qrContainer.innerHTML = '';

    const shapeMap = {
      'Square': 'square',
      'Rounded': 'rounded',
      'Dots': 'dots',
      'Extra-Rounded': 'extra-rounded',
      'Classy-Rounded': 'classy-rounded',
    };
    const selectedShape = shapeMap[shapeSelect.value] || 'square';

    qrCode = new QRCodeStyling({
      width: 200,
      height: 200,
      data: qrData,
      image: logoDataUrl,
      dotsOptions: {
        color: colorInput.value,
        type: selectedShape,
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 5,
        imageSize: 0.2,
        hideBehindDots: true,
      },
      cornersSquareOptions: {
        color: colorInput.value,
        type: selectedShape,
      },
      cornersDotOptions: {
        color: colorInput.value,
        type: selectedShape,
      },
    });

    // Render QR code as image, then draw with title onto custom canvas
    qrCode.getRawData('png').then(renderQRCodeWithTitle);
  }

  // User data and link logic
  if (document.getElementById('linkForm')) {
    fetch('/qr/user')
      .then(res => res.json())
      .then(user => {
        qrData = window.location.origin + '/' + user.username;

        if (document.getElementById('username')) document.getElementById('username').innerText = user.username;
        if (document.getElementById('publicPageUrlLink')) document.getElementById('publicPageUrlLink').href = '/' + user.username;
        if (document.getElementById('publicPageUrl')) document.getElementById('publicPageUrl').value = qrData;
        if (document.getElementById('currentLink')) document.getElementById('currentLink').value = user.currentLink || qrData;

        // Initial QR render
        renderQRCode();

        const qrCustomForm = document.getElementById('qrCustomForm');
if (qrCustomForm) {
  qrCustomForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form reload
    renderQRCode();
  });
}

        // colorInput.addEventListener('input', renderQRCode);
        // shapeSelect.addEventListener('change', renderQRCode);
        // titleInput.addEventListener('input', renderQRCode);

        uploadBtn.addEventListener('click', () => {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.click();

          fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
              logoDataUrl = evt.target.result;
              renderQRCode();
            };
            reader.readAsDataURL(file);
          });
        });

        if (downloadBtn) {
          downloadBtn.addEventListener('click', () => {
            // Download custom canvas (includes title)
            const qrCanvas = qrContainer.querySelector('canvas.qr-final-canvas');
            if (qrCanvas) {
              const url = qrCanvas.toDataURL("image/png");
              const a = document.createElement('a');
              a.href = url;
              a.download = (titleInput.value.trim() || 'qr_code') + '.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          });
        }

        // Link history table
        if (user.linkHistory && Array.isArray(user.linkHistory)) {
          const historyRows = user.linkHistory.map(h => `<tr>
            <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">${new Date(h.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-gray-500">${h.link}</td>
          </tr>`);
          const historyTableBody = document.getElementById('linkHistory');
          if (historyTableBody) historyTableBody.innerHTML = historyRows.join('');
        }

        // Link form submit
        const linkForm = document.getElementById('linkForm');
        if (linkForm) {
          linkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newLink = document.getElementById('newLink').value;
            fetch('/qr/update-link', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ newLink }),
            }).then(() => window.location.reload());
          });
        }

        // Delete account
        const deleteBtn = document.getElementById('deleteAccount');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              fetch('/auth/delete', { method: 'DELETE' }).then(res => {
                if (res.ok) {
                  alert('Account deleted.');
                  window.location.href = '/';
                } else {
                  alert('Error deleting account.');
                }
              });
            }
          });
        }
      });
  }

  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Load saved theme from localStorage if present
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark');
    themeToggle.checked = true;
  }

  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  });



  // Password visibility toggle
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "Hide";
      } else {
        passwordInput.type = "password";
        togglePassword.textContent = "Show";
      }
    });
  }
});

// Tailwind config (unchanged)
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9',
        secondary: '#64748B',
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
        button: '8px',
      },
    },
  },
};
