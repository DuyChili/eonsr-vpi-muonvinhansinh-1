AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
});
var theaterSwiper = new Swiper(".theaterSwiper", {
    slidesPerView: "auto",
    centeredSlides: true,
    loop: true,
    loopAdditionalSlides: 3,
    grabCursor: true,
    spaceBetween: 16,
});

var pmqSwiper = new Swiper(".pmqSwiper", {
    slidesPerView: 4.25,
    spaceBetween: 20,
    pagination: {
        el: ".pmq-pagination",
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '"></span>';
        },
    },
    grabCursor: true,
    preventClicks: true,          // ✅ cho phép click
    preventClicksPropagation: true,
    breakpoints: {
        320: { slidesPerView: 1.33, spaceBetween: 16 },
        576: { slidesPerView: 2.25, spaceBetween: 16 },
        768: { slidesPerView: 3.25, spaceBetween: 20 },
        1200: { slidesPerView: 4.25, spaceBetween: 20 }
    }
});

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

const dateBtns = document.querySelectorAll('.date-btn');
dateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        dateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
var artSwiper = new Swiper(".artSwiper", {
    slidesPerView: "auto",
    spaceBetween: 18,
    grabCursor: true,
    freeMode: true,
});
const artistCards = document.querySelectorAll('.artist-card');
artistCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        artistCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    });
});


// ==========================================
// MODAL SYSTEM
// ==========================================
const successModal = document.getElementById('successModal');
const otpModal = document.getElementById('otpModal');
const modalDate = document.getElementById('modalDate');
const otpEmailDisplay = document.getElementById('otpEmailDisplay');
const otpInputs = document.querySelectorAll('.otp-input');
const otpErrorMsg = document.getElementById('otpErrorMsg');
const otpConfirmBtn = document.getElementById('otpConfirmBtn');
const otpResend = document.getElementById('otpResend');
const otpTimerWrapper = document.getElementById('otpTimerWrapper');

let otpCountdownInterval = null;
let generatedOTP = '';

// Tạo OTP 4 số ngẫu nhiên
function generateOTP() {
    return '000000';
}

// Mở / đóng modal
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Đếm ngược OTP
function startOTPTimer() {
    let seconds = 60;
    document.getElementById('otpCountdown').textContent = seconds;
    otpTimerWrapper.style.display = 'block';
    otpResend.classList.remove('visible');

    clearInterval(otpCountdownInterval);
    otpCountdownInterval = setInterval(() => {
        seconds--;
        document.getElementById('otpCountdown').textContent = seconds;
        if (seconds <= 0) {
            clearInterval(otpCountdownInterval);
            otpTimerWrapper.style.display = 'none';
            otpResend.classList.add('visible');
        }
    }, 1000);
}

// Reset OTP inputs
function resetOTPInputs() {
    otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });
    otpErrorMsg.textContent = '';
    otpInputs[0].focus();
}

// Gửi OTP (giả lập — thay bằng API thật)
function sendOTP(email) {
    generatedOTP = generateOTP();
    console.log(`OTP gửi đến ${email}: ${generatedOTP}`); // DEV only — xóa khi production
    // TODO: gọi API gửi mail thật ở đây
}

// OTP input behavior
otpInputs.forEach((input, index) => {
    input.addEventListener('input', function () {
        // Chỉ cho nhập số
        this.value = this.value.replace(/[^0-9]/g, '');

        if (this.value) {
            this.classList.add('filled');
            this.classList.remove('error');
            // Chuyển sang ô tiếp theo
            if (index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        } else {
            this.classList.remove('filled');
        }
    });

    input.addEventListener('keydown', function (e) {
        // Backspace về ô trước
        if (e.key === 'Backspace' && !this.value && index > 0) {
            otpInputs[index - 1].focus();
            otpInputs[index - 1].value = '';
            otpInputs[index - 1].classList.remove('filled');
        }
    });

    // Paste OTP
    input.addEventListener('paste', function (e) {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
        paste.split('').forEach((char, i) => {
            if (otpInputs[i]) {
                otpInputs[i].value = char;
                otpInputs[i].classList.add('filled');
            }
        });
        otpInputs[Math.min(paste.length, 5)].focus();
    });
});

// Xác nhận OTP
otpConfirmBtn.addEventListener('click', function () {
    const entered = Array.from(otpInputs).map(i => i.value).join('');

    if (entered.length < 6) {
        otpErrorMsg.textContent = 'Vui lòng nhập đủ 6 số.';
        return;
    }

    if (entered === generatedOTP) {
        clearInterval(otpCountdownInterval);
        closeModal(otpModal);

        // Lấy ngày active
        const activeBtn = document.querySelector('.date-btn.active');
        if (activeBtn) modalDate.textContent = activeBtn.textContent;

        setTimeout(() => openModal(successModal), 300);
    } else {
        otpErrorMsg.textContent = 'Mã OTP không đúng. Vui lòng thử lại.';
        otpInputs.forEach(i => i.classList.add('error'));
        setTimeout(() => {
            otpInputs.forEach(i => i.classList.remove('error'));
        }, 600);
    }
});

// Gửi lại OTP
otpResend.addEventListener('click', function () {
    const email = document.querySelector('#registerForm input[type="email"]').value;
    sendOTP(email);
    resetOTPInputs();
    startOTPTimer();
});

// Submit form → mở OTP modal
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    otpEmailDisplay.textContent = email;
    sendOTP(email);
    resetOTPInputs();
    startOTPTimer();
    openModal(otpModal);
});

// Đóng modal
document.getElementById('otpModalClose').addEventListener('click', () => {
    clearInterval(otpCountdownInterval);
    closeModal(otpModal);
});

document.getElementById('modalClose').addEventListener('click', () => closeModal(successModal));
document.getElementById('modalCloseBtn').addEventListener('click', () => closeModal(successModal));

// Click ngoài để đóng
[otpModal, successModal].forEach(modal => {
    modal.addEventListener('click', function (e) {
        if (e.target === this) {
            clearInterval(otpCountdownInterval);
            closeModal(this);
        }
    });
});

// ESC để đóng
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        clearInterval(otpCountdownInterval);
        closeModal(otpModal);
        closeModal(successModal);
    }
});