// QRCode library: https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('linkForm')) {
      fetch('/qr/user')
        .then(res => res.json())
        .then(user => {
          document.getElementById('username').innerText = user.username;
          generateQR(window.location.origin + '/' + user.username);
          document.getElementById('currentLink').innerText = user.currentLink;
          let history = user.linkHistory.map(h => `<li>${h.link} (${new Date(h.createdAt).toLocaleString()})</li>`).join('');
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
    }
  });
  
  function generateQR(url) {
    document.getElementById('qrcode').innerHTML = '';
    new QRCode(document.getElementById('qrcode'), {
      text: url,
      width: 200,
      height: 200
    });
  }
  