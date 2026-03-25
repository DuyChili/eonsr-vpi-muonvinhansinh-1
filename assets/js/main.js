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

// Modal success
const successModal = document.getElementById('successModal');
const modalClose = document.getElementById('modalClose');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalDate = document.getElementById('modalDate');

function openModal() {
    // Lấy ngày đang active
    const activeBtn = document.querySelector('.date-btn.active');
    if (activeBtn) modalDate.textContent = activeBtn.textContent;
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Gắn vào form submit
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    openModal();
});

modalClose.addEventListener('click', closeModal);
modalCloseBtn.addEventListener('click', closeModal);

// Click ngoài modal để đóng
successModal.addEventListener('click', function(e) {
    if (e.target === successModal) closeModal();
});

// Phím ESC để đóng
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});