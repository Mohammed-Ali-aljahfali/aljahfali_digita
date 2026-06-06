// الجحفلي للحلول الرقمية - Professional Interactions

const siteHeader = document.getElementById('siteHeader');
const scrollProgress = document.getElementById('scrollProgress');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('scrolled', window.scrollY > 35);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  scrollProgress.style.width = `${pct}%`;
});

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-xmark');
  });
}

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('active');
    const icon = menuToggle?.querySelector('i');
    if (icon) {
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-xmark');
    }
  });
});

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// Contact form sends prepared WhatsApp message only; no backend/database.
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(contactForm);
    const text = `
طلب خدمة جديد من موقع الجحفلي للحلول الرقمية:
الاسم: ${data.get('name') || ''}
الهاتف: ${data.get('phone') || ''}
البريد الإلكتروني: ${data.get('email') || ''}
نوع الخدمة: ${data.get('service') || ''}
الميزانية التقريبية: ${data.get('budget') || ''}
وصف المشروع:
${data.get('message') || ''}
    `.trim();

    const url = `https://wa.me/967782611415?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    const note = document.getElementById('formNote');
    if (note) note.textContent = 'تم تجهيز رسالتك، سيتم فتح واتساب لإرسال الطلب.';
  });
}
