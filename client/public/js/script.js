// QRCode library: https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js

function generateQR(targetId, text, width = 200, height = 200) {
  const container = document.getElementById(targetId);
  container.innerHTML = '';
  new QRCode(container, {
    text,
    width,
    height
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // For login/signup password visibility toggle
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
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

// Dashboard logic
document.addEventListener('DOMContentLoaded', function() {
  // Dashboard page logic
  if (document.getElementById('linkForm')) {
    fetch('/qr/user')
      .then(res => res.json())
      .then(user => {
        document.getElementById('username').innerText = user.username;
        document.getElementById('publicPageUrlLink').href = '/' + user.username;
        document.getElementById('publicPageUrl').value = window.location.origin + '/' + user.username;
        // QR code encodes the public page URL, not the current link!
        generateQR('qrcode', window.location.origin + '/' + user.username);
        document.getElementById('currentLink').value = user.currentLink;
        let history = user.linkHistory.map(h => `<tr>
<td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">(${new Date(h.createdAt).toLocaleDateString()})</td>
<td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${h.link}</td>
<td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">1,234</td>
</tr>`);
        document.getElementById('linkHistory').innerHTML = history;
      });

    document.getElementById('linkForm').addEventListener('submit', function(e) {
      e.preventDefault();
      let newLink = document.getElementById('newLink').value;
      fetch('/qr/update-link', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newLink })
      }).then(() => window.location.reload());
    });

    if (document.getElementById('deleteAccount')) {
  document.getElementById('deleteAccount').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      fetch('/auth/delete', { method: 'DELETE' })
        .then(res => {
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

    // Download QR functionality
    document.getElementById('downloadQR').addEventListener('click', function() {
      const width = parseInt(document.getElementById('qrWidth').value) || 200;
      const height = parseInt(document.getElementById('qrHeight').value) || 200;
      fetch('/qr/user')
        .then(res => res.json())
        .then(user => {
          // Regenerate QR with custom size for the public page URL
          generateQR('qrcode', window.location.origin + '/' + user.username, width, height);
          setTimeout(() => {
            const qrCanvas = document.querySelector('#qrcode canvas');
            if (qrCanvas) {
              const link = document.createElement('a');
              link.href = qrCanvas.toDataURL('image/png');
              link.download = `qr_${user.username}.png`;
              link.click();
              // Regenerate original size after download
              generateQR('qrcode', window.location.origin + '/' + user.username);
            }
          }, 500);
        });
    });
  }
});
