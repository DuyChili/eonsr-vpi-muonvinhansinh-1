// ============================================================
// CONFIG API
// ============================================================
const API_BASE = 'https://event-vanphu.eonsr.com/api';
const BASIC_AUTH = 'Basic ' + btoa('vanphu_api:VanPhu@2026!'); // ← đổi username:password thực

function apiPost(endpoint, body) {
    return fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': BASIC_AUTH,
        },
        body: JSON.stringify(body),
    }).then(async (res) => {
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
    });
}

// ============================================================
// AOS + SWIPER INIT
// ============================================================
AOS.init({
    duration: 600,
    easing: 'ease-out-quad',
    once: true,
    offset: 60,
    disable: function () {
        return window.innerWidth < 480;
    }
});

var theaterSwiper = new Swiper(".theaterSwiper", {
    slidesPerView: "auto",
    centeredSlides: true,
    loop: true,
    loopAdditionalSlides: 3,
    grabCursor: true,
    spaceBetween: 16,
    autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
    speed: 700,
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
    preventClicks: true,
    preventClicksPropagation: true,
    breakpoints: {
        320: { slidesPerView: 1.33, spaceBetween: 16 },
        576: { slidesPerView: 2.25, spaceBetween: 16 },
        768: { slidesPerView: 3.25, spaceBetween: 20 },
        1200: { slidesPerView: 4.25, spaceBetween: 20 }
    }
});

var artSwiper = new Swiper(".artSwiper", {
    slidesPerView: "auto",
    spaceBetween: 18,
    grabCursor: true,
    freeMode: true,
});

// ============================================================
// HEADER SCROLL
// ============================================================
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
});

// ============================================================
// DATE BUTTONS
// ============================================================
const DATE_MAP = {
    '17/4 Thứ Sáu': '2026-04-17',
    '18/4 Thứ Bảy': '2026-04-18',
    '19/4 Chủ Nhật': '2026-04-19',
};
const DATE_LABEL_MAP = {
    '2026-04-17': 'Thứ Sáu, 17/04/2026',
    '2026-04-18': 'Thứ Bảy, 18/04/2026',
    '2026-04-19': 'Chủ Nhật, 19/04/2026',
};
let selectedDate = '2026-04-17';

const dateBtns = document.querySelectorAll('.date-btn');
dateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        dateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDate = DATE_MAP[btn.textContent.trim()] || '2026-04-17';
    });
});

// ============================================================
// ARTIST CARDS
// ============================================================
const artistCards = document.querySelectorAll('.artist-card');
artistCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        if (window.innerWidth > 991) {
            artistCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        }
    });
    card.addEventListener('click', function () {
        if (window.innerWidth <= 991) {
            const isAlreadyActive = this.classList.contains('active');
            artistCards.forEach(c => c.classList.remove('active'));
            if (!isAlreadyActive) this.classList.add('active');
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }, 250);
        }
    });
});

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================================
// OTP MODAL — elements & state
// ============================================================
const successModal = document.getElementById('successModal');
const otpModal = document.getElementById('otpModal');
const otpEmailDisplay = document.getElementById('otpEmailDisplay');
const otpInputs = document.querySelectorAll('.otp-input');
const otpErrorMsg = document.getElementById('otpErrorMsg');
const otpConfirmBtn = document.getElementById('otpConfirmBtn');
const otpResend = document.getElementById('otpResend');
const otpTimerWrapper = document.getElementById('otpTimerWrapper');

let otpCountdownInterval = null;
let currentEmail = '';
let currentFullName = '';
let currentSelectedDate = '';

// OTP inputs — navigate, paste
otpInputs.forEach((input, index) => {
    input.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value) {
            this.classList.add('filled');
            this.classList.remove('error');
            if (index < otpInputs.length - 1) otpInputs[index + 1].focus();
        } else {
            this.classList.remove('filled');
        }
    });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !this.value && index > 0) {
            otpInputs[index - 1].focus();
            otpInputs[index - 1].value = '';
            otpInputs[index - 1].classList.remove('filled');
        }
    });
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

function resetOTPInputs() {
    otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });
    otpErrorMsg.textContent = '';
}

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

function openOtpModal(email) {
    otpEmailDisplay.textContent = email;
    resetOTPInputs();
    startOTPTimer();
    openModal(otpModal);
    setTimeout(() => otpInputs[0].focus(), 300);
}

// ============================================================
// FORM SUBMIT → Create Guest → Send OTP
// ============================================================
const registerForm = document.getElementById('registerForm');
const submitBtn = registerForm.querySelector('.submit-btn');

registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fullName = this.querySelector('input[type="text"]').value.trim();
    const email = this.querySelector('input[type="email"]').value.trim();
    const phone = this.querySelector('input[type="tel"]').value.trim();

    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Đang xử lý…';

    try {
        // Bước 1: Tạo khách
        const createRes = await apiPost('/guests', {
            full_name: fullName,
            email: email,
            phone: phone,
            event_date: selectedDate,
            guest_type: 'Khách Đăng Ký',
        });

        if (!createRes.ok && createRes.status !== 422) {
            throw new Error(createRes.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        }

        // Bước 2: Gửi OTP
        const otpRes = await apiPost('/guest/send-otp', {
            full_name: fullName,
            email: email,
        });

        if (!otpRes.ok) {
            if (otpRes.status === 429) {
                const secs = Math.ceil(otpRes.data?.data?.remaining_seconds || 300);
                throw new Error(`Email vừa được gửi OTP. Vui lòng thử lại sau ${secs} giây.`);
            }
            throw new Error(otpRes.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
        }

        // Lưu state, mở OTP modal
        currentEmail = email;
        currentFullName = fullName;
        currentSelectedDate = selectedDate;
        openOtpModal(email);

    } catch (err) {
        alert(err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});

// ============================================================
// VERIFY OTP
// ============================================================
otpConfirmBtn.addEventListener('click', async function () {
    const entered = Array.from(otpInputs).map(i => i.value).join('');

    if (entered.length < 6) {
        otpErrorMsg.textContent = 'Vui lòng nhập đủ 6 số.';
        return;
    }

    otpErrorMsg.textContent = '';
    const originalText = this.textContent;
    this.disabled = true;
    this.textContent = 'Đang xác nhận…';

    try {
        const res = await apiPost('/guest/verify-otp', {
            email: currentEmail,
            otp: entered,
        });

        if (!res.ok) {
            otpErrorMsg.textContent = res.data?.message || 'Mã OTP không đúng. Vui lòng thử lại.';
            otpInputs.forEach(i => i.classList.add('error'));
            setTimeout(() => otpInputs.forEach(i => i.classList.remove('error')), 600);
            return;
        }

        // Thành công
        clearInterval(otpCountdownInterval);
        closeModal(otpModal);
        document.getElementById('modalDate').textContent = DATE_LABEL_MAP[currentSelectedDate] || currentSelectedDate;

        // Reset form về trạng thái ban đầu
        registerForm.reset();
        dateBtns.forEach(b => b.classList.remove('active'));
        dateBtns[0].classList.add('active');
        selectedDate = '2026-04-17';

        setTimeout(() => openModal(successModal), 300);

    } catch {
        otpErrorMsg.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
    } finally {
        this.disabled = false;
        this.textContent = originalText;
    }
});

// ============================================================
// RESEND OTP
// ============================================================
otpResend.addEventListener('click', async function () {
    this.disabled = true;
    otpErrorMsg.textContent = '';

    try {
        const res = await apiPost('/guest/send-otp', {
            full_name: currentFullName,
            email: currentEmail,
        });

        if (!res.ok) {
            if (res.status === 429) {
                const secs = Math.ceil(res.data?.data?.remaining_seconds || 300);
                otpErrorMsg.textContent = `Vui lòng thử lại sau ${secs} giây.`;
            } else {
                otpErrorMsg.textContent = res.data?.message || 'Không thể gửi lại OTP.';
            }
        } else {
            resetOTPInputs();
            startOTPTimer();
        }
    } catch {
        otpErrorMsg.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
    } finally {
        this.disabled = false;
    }
});

// ============================================================
// ĐÓNG MODAL
// ============================================================
document.getElementById('otpModalClose').addEventListener('click', () => {
    clearInterval(otpCountdownInterval);
    closeModal(otpModal);
});
document.getElementById('modalClose').addEventListener('click', () => closeModal(successModal));

// Nút "Đã hiểu" → chỉ đóng modal
document.getElementById('modalCloseBtn').addEventListener('click', () => {
    closeModal(successModal);
});

// Click ngoài modal để đóng
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

// ============================================================
// COUNTER ANIMATION
// ============================================================
(function () {
    const counterEl = document.querySelector('.register-counter .num-wrapper span');
    if (!counterEl) return;
    const target = parseInt(counterEl.textContent.replace(/\D/g, ''), 10);

    function animateCount(el, to, duration) {
        const startTime = performance.now();
        function update(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.floor(eased * to).toLocaleString('vi-VN');
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            animateCount(counterEl, target, 2000);
        }
    }, { threshold: 0.5 }).observe(counterEl);
})();

// ============================================================
// FAB BUTTON
// ============================================================
(function () {
    const fab = document.getElementById('fabCTA');
    const fabBtn = document.getElementById('fabBtn');
    const registerSection = document.querySelector('.register-section');
    if (!fab || !fabBtn || !registerSection) return;

    const showAfter = window.innerHeight * 0.6;

    function updateFab() {
        const scrollY = window.scrollY;
        const registerTop = registerSection.getBoundingClientRect().top + scrollY;
        const nearRegister = scrollY + window.innerHeight > registerTop + 100;
        fab.classList.toggle('visible', scrollY > showAfter && !nearRegister);
    }

    window.addEventListener('scroll', updateFab, { passive: true });
    updateFab();

    fabBtn.addEventListener('click', function () {
        registerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
            const firstInput = registerSection.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 700);
    });

    setTimeout(function () {
        if (fab.classList.contains('visible') && window.innerWidth > 767) {
            fab.classList.add('tooltip-visible');
            setTimeout(() => fab.classList.remove('tooltip-visible'), 2500);
        }
    }, 3000);
})();