document.addEventListener('DOMContentLoaded', () => {
  const colorInput = document.getElementById('qrColor');
  const shapeSelect = document.getElementById('qrShape');
  const titleInput = document.getElementById('qrTitle');
  const uploadBtn = document.getElementById('uploadLogoBtn');
  const qrContainer = document.getElementById('qrcode');
  const downloadBtn = document.getElementById('downloadQR');

  let qrCode = null;
  let logoDataUrl = null;
  let qrData = "";

  function renderQRCodeWithTitle(qrImageBlob) {
    const qrSize = 200;
    const border = 8;
    const titleHeight = titleInput.value.trim() !== "" ? 30 : 0;
    const canvas = document.createElement('canvas');
    canvas.width = qrSize + border * 2;
    canvas.height = qrSize + border * 2 + titleHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (titleHeight > 0) {
      ctx.fillStyle = '#111';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(titleInput.value.trim(), canvas.width / 2, 10);
    }

    const qrImg = new window.Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, border, titleHeight + border, qrSize, qrSize);
      qrContainer.appendChild(canvas);
    };
    qrImg.src = URL.createObjectURL(qrImageBlob);

    canvas.className = "qr-final-canvas rounded";
  }

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

    qrCode.getRawData('png').then(renderQRCodeWithTitle);
  }

  if (document.getElementById('linkForm')) {
    fetch('/qr/user')
      .then(res => res.json())
      .then(user => {
        qrData = window.location.origin + '/' + user.username;

        if (document.getElementById('username')) document.getElementById('username').innerText = user.username;
        if (document.getElementById('publicPageUrlLink')) document.getElementById('publicPageUrlLink').href = '/' + user.username;
        if (document.getElementById('publicPageUrl')) document.getElementById('publicPageUrl').value = qrData;
        if (document.getElementById('currentLink')) document.getElementById('currentLink').value = user.currentLink || qrData;

        renderQRCode();

        const qrCustomForm = document.getElementById('qrCustomForm');
        if (qrCustomForm) {
          qrCustomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            renderQRCode();
          });
        }

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
            const qrCanvas = qrContainer.querySelector('canvas.qr-final-canvas');
            if (qrCanvas) {
              const inputHeight = parseInt(document.getElementById('qrHeight').value) || 200;
              const inputWidth = parseInt(document.getElementById('qrWidth').value) || 200;

              const resizedCanvas = document.createElement('canvas');
              resizedCanvas.width = inputWidth;
              resizedCanvas.height = inputHeight;
              const ctx = resizedCanvas.getContext('2d');

              ctx.drawImage(qrCanvas, 0, 0, inputWidth, inputHeight);

              const url = resizedCanvas.toDataURL('image/png');
              const a = document.createElement('a');
              a.href = url;
              a.download = (titleInput.value.trim() || 'qr_code') + '.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          });
        }

        if (user.linkHistory && Array.isArray(user.linkHistory)) {
          const historyRows = user.linkHistory.map(h => `<tr>
            <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">${new Date(h.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-gray-500">${h.link}</td>
          </tr>`);
          const historyTableBody = document.getElementById('linkHistory');
          if (historyTableBody) historyTableBody.innerHTML = historyRows.join('');
        }

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

const copyBtn = document.getElementById('copyPublicUrlBtn');
const publicUrlInput = document.getElementById('publicPageUrl');

if (copyBtn && publicUrlInput) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(publicUrlInput.value).then(() => {
      copyBtn.classList.add('text-primary');
      setTimeout(() => copyBtn.classList.remove('text-primary'), 500);
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("themeToggle");
  const themeDropdown = document.getElementById("themeDropdown");
  const themeOptions = document.querySelectorAll(".theme-option");

  let currentTheme = localStorage.getItem("theme") || "light";

  function applyTheme(theme) {
    if (
      theme === "dark" ||
      (theme === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)")
          .matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const icon = themeToggle.querySelector("i");
    if (document.documentElement.classList.contains("dark")) {
      icon.className =
        "ri-moon-line text-xl text-gray-700 dark:text-gray-300";
    } else {
      icon.className =
        "ri-sun-line text-xl text-gray-700 dark:text-gray-300";
    }
  }

  applyTheme(currentTheme);

  themeToggle.addEventListener("click", function () {
    themeDropdown.classList.toggle("show");
  });

  document.addEventListener("click", function (e) {
    if (
      !themeToggle.contains(e.target) &&
      !themeDropdown.contains(e.target)
    ) {
      themeDropdown.classList.remove("show");
    }
  });

  themeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const theme = this.dataset.theme;
      currentTheme = theme;
      localStorage.setItem("theme", theme);
      applyTheme(theme);
      themeDropdown.classList.remove("show");
    });
  });

  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function () {
        if (currentTheme === "auto") {
          applyTheme("auto");
        }
      });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  loginForm.addEventListener("submit", function (e) {
    const submitButton = this.querySelector(
      'button[type="submit"]'
    );
    submitButton.textContent = "Signing In...";
    submitButton.disabled = true;


  });

  signupForm.addEventListener("submit", function (e) {
    const submitButton = this.querySelector(
      'button[type="submit"]'
    );
    submitButton.textContent = "Creating Account...";
    submitButton.disabled = true;


  });
});

document.addEventListener("DOMContentLoaded", function () {
  const loginEmail = document.getElementById("loginEmail");
  const signupEmail = document.getElementById("signupEmail");
  const loginEmailError =
    document.getElementById("loginEmailError");
  const signupEmailError =
    document.getElementById("signupEmailError");

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  loginEmail.addEventListener("blur", function () {
    if (this.value && !validateEmail(this.value)) {
      loginEmailError.classList.remove("hidden");
      this.classList.add("border-red-500");
    } else {
      loginEmailError.classList.add("hidden");
      this.classList.remove("border-red-500");
    }
  });

  signupEmail.addEventListener("blur", function () {
    if (this.value && !validateEmail(this.value)) {
      signupEmailError.classList.remove("hidden");
      this.classList.add("border-red-500");
    } else {
      signupEmailError.classList.add("hidden");
      this.classList.remove("border-red-500");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.getElementById("signupPassword");
  const strengthBar = document.getElementById("passwordStrength");
  const strengthText = document.getElementById("strengthText");

  passwordInput.addEventListener("input", function () {
    const password = this.value;
    const strength = calculatePasswordStrength(password);

    strengthBar.className = "password-strength";

    if (strength < 3) {
      strengthBar.classList.add("strength-weak");
      strengthText.textContent = "Weak";
    } else if (strength < 5) {
      strengthBar.classList.add("strength-medium");
      strengthText.textContent = "Medium";
    } else {
      strengthBar.classList.add("strength-strong");
      strengthText.textContent = "Strong";
    }
  });

  function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');

  if (mode === 'signup') {
    switchToSignup();
  } else if (mode === 'login') {
    switchToLogin();
  }
});
let isSignupMode = false;

function switchToSignup() {
  if (!isSignupMode) {
    document
      .getElementById("slideWrapper")
      .classList.add("show-signup");
    isSignupMode = true;
  }
}

function switchToLogin() {
  if (isSignupMode) {
    document
      .getElementById("slideWrapper")
      .classList.remove("show-signup");
    isSignupMode = false;
  }
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.className = "ri-eye-off-line text-gray-400";
  } else {
    input.type = "password";
    icon.className = "ri-eye-line text-gray-400";
  }
}

function toggleCheckbox(inputId, element) {
  const input = document.getElementById(inputId);
  const icon = element.querySelector("i");

  input.checked = !input.checked;

  if (input.checked) {
    element.classList.add("bg-primary", "border-primary");
    element.classList.remove(
      "border-gray-300",
      "dark:border-gray-600"
    );
    icon.classList.remove("hidden");
  } else {
    element.classList.remove("bg-primary", "border-primary");
    element.classList.add(
      "border-gray-300",
      "dark:border-gray-600"
    );
    icon.classList.add("hidden");
  }
}