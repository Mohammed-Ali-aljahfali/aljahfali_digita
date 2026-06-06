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
    menuToggle.classList.toggle('active');
  });
}

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('active');
    menuToggle?.classList.remove('active');
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

// Contact form sends prepared WhatsApp message or copies and redirects to Telegram Bot.
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(contactForm);
    const text = `
طلب خدمة جديد من موقع الجحفلي للحلول الرقمية:
------------------------------------------
الاسم: ${data.get('name') || ''}
الهاتف: ${data.get('phone') || ''}
البريد الإلكتروني: ${data.get('email') || ''}
نوع الخدمة: ${data.get('service') || ''}
الميزانية التقريبية: ${data.get('budget') || ''}
وصف المشروع:
${data.get('message') || ''}
------------------------------------------
تم الإرسال من موقع: aljahfalidigital.com
    `.trim();

    const submitter = e.submitter;
    const action = submitter ? submitter.getAttribute('data-action') : 'whatsapp';
    const note = document.getElementById('formNote');

    if (action === 'telegram') {
      // Copy to clipboard and open Telegram bot
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          if (note) note.textContent = 'تم نسخ تفاصيل طلبك تلقائياً! سيفتح تليجرام الآن، يرجى لصق الرسالة وإرسالها للبوت.';
          setTimeout(() => {
            window.open('https://t.me/AljahfaliDigitalBot', '_blank');
          }, 1500);
        }).catch(() => {
          if (note) note.textContent = 'يرجى فتح تليجرام ومراسلة البوت @AljahfaliDigitalBot مباشرة.';
          window.open('https://t.me/AljahfaliDigitalBot', '_blank');
        });
      } else {
        // Fallback if clipboard API is not supported
        if (note) note.textContent = 'سيفتح تليجرام الآن لمراسلة البوت @AljahfaliDigitalBot.';
        window.open('https://t.me/AljahfaliDigitalBot', '_blank');
      }
    } else {
      // Default: WhatsApp redirection
      const url = `https://wa.me/967782611415?text=${encodeURIComponent(text)}`;
      if (note) note.textContent = 'تم تجهيز رسالتك، سيتم فتح واتساب لإرسال الطلب.';
      window.open(url, '_blank');
    }
  });
}

// Dynamic Section Glow Background Observer (Design Inspiration from e-jaib.com)
const glowSections = document.querySelectorAll('section[data-glow-color], header[data-glow-color], footer[data-glow-color]');
const glowContainer = document.getElementById('dynamicGlowContainer');
const glowLayers = [
  document.getElementById('glowLayer1'),
  document.getElementById('glowLayer2')
];
let activeGlowLayerIdx = 0;

if (glowContainer && glowLayers[0] && glowLayers[1]) {
  const glowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target;
        const color = section.getAttribute('data-glow-color') || 'rgba(0, 217, 255, 0.15)';
        const posX = section.getAttribute('data-glow-x') || '50%';
        const posY = section.getAttribute('data-glow-y') || '50%';
        
        // Target the inactive layer
        const inactiveLayerIdx = 1 - activeGlowLayerIdx;
        const inactiveLayer = glowLayers[inactiveLayerIdx];
        const activeLayer = glowLayers[activeGlowLayerIdx];
        
        // Update styling of the inactive layer
        inactiveLayer.style.setProperty('--glow-color', color);
        inactiveLayer.style.setProperty('--glow-x', posX);
        inactiveLayer.style.setProperty('--glow-y', posY);
        
        // Crossfade layers
        inactiveLayer.classList.add('active');
        activeLayer.classList.remove('active');
        
        // Swap indices
        activeGlowLayerIdx = inactiveLayerIdx;
      }
    });
  }, {
    threshold: 0.15, // trigger when 15% of the section enters the viewport
    rootMargin: '-20% 0px -30% 0px' // offset boundaries to focus on current scroll section
  });

  glowSections.forEach(sec => glowObserver.observe(sec));
}

