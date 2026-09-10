/* ============================================================
   MEDIA PEMBELAJARAN K3 — SCRIPT UTAMA
   ============================================================ */

// ===== KUNCI JAWABAN KUIS =====
const kunciJawaban = {
  q1: 'b', q2: 'c', q3: 'a', q4: 'd', q5: 'b',
  q6: 'a', q7: 'c', q8: 'b', q9: 'd', q10: 'a'
};

/* ============================================================
   KUIS — Submit & hitung skor
   ============================================================ */
function submitKuis() {
  let benar = 0;
  const total = Object.keys(kunciJawaban).length;
  let belumDijawab = 0;

  for (let key in kunciJawaban) {
    const dipilih = document.querySelector(`input[name="${key}"]:checked`);
    if (!dipilih) belumDijawab++;
    else if (dipilih.value === kunciJawaban[key]) benar++;
  }

  if (belumDijawab > 0) {
    if (!confirm(`Masih ada ${belumDijawab} soal yang belum dijawab. Yakin ingin mengirim?`)) {
      return;
    }
  }

  const skor = Math.round((benar / total) * 100);
  localStorage.setItem('skorK3', skor);
  localStorage.setItem('benarK3', benar);
  localStorage.setItem('totalK3', total);

  // Animasi pindah halaman
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s';
  setTimeout(() => { window.location.href = 'hasil.html'; }, 400);
}

/* ============================================================
   HASIL — Tampilkan skor
   ============================================================ */
function tampilkanHasil() {
  const skor = localStorage.getItem('skorK3') || 0;
  const benar = localStorage.getItem('benarK3') || 0;
  const total = localStorage.getItem('totalK3') || 10;

  const skorEl = document.getElementById('skor');
  const detailEl = document.getElementById('detail');
  const statusEl = document.getElementById('status');

  if (!skorEl) return;

  // Animasi counter angka
  let current = 0;
  const step = Math.max(1, Math.ceil(skor / 40));
  const timer = setInterval(() => {
    current += step;
    if (current >= skor) { current = skor; clearInterval(timer); }
    skorEl.textContent = current;
  }, 25);

  if (detailEl) detailEl.textContent = `Benar ${benar} dari ${total} soal`;

  if (statusEl) {
    if (skor >= 75) {
      statusEl.textContent = '✅ LULUS';
      statusEl.className = 'status lulus';
    } else {
      statusEl.textContent = '❌ BELUM LULUS';
      statusEl.className = 'status gagal';
    }
  }
}

/* ============================================================
   LATIHAN — Cek jawaban isian
   ============================================================ */
function cekLatihan() {
  const inputs = document.querySelectorAll('.latihan-input');
  let benar = 0;

  inputs.forEach((inp) => {
    const kunci = inp.dataset.kunci.toLowerCase().split('|');
    const val = inp.value.trim().toLowerCase();

    if (val && kunci.includes(val)) {
      inp.style.borderColor = '#4caf50';
      inp.style.background = '#e8f5e9';
      benar++;
    } else {
      inp.style.borderColor = '#f44336';
      inp.style.background = '#ffebee';
    }
  });

  const total = inputs.length;
  const nilai = Math.round((benar / total) * 100);

  const hasilBox = document.getElementById('hasilLatihan');
  const pesan = document.getElementById('pesanHasil');

  if (hasilBox && pesan) {
    hasilBox.style.display = 'block';

    let predikat = '';
    if (nilai >= 90) predikat = '🌟 Sangat Baik';
    else if (nilai >= 75) predikat = '👍 Baik';
    else if (nilai >= 60) predikat = '📖 Cukup';
    else predikat = '💪 Perlu Belajar Lagi';

    pesan.innerHTML = `Jawaban benar: <b>${benar}</b> dari <b>${total}</b> soal<br>
                       Nilai: <b>${nilai}</b> — ${predikat}`;

    hasilBox.scrollIntoView({ behavior: 'smooth' });
  } else {
    alert(`Jawaban benar: ${benar} dari ${total}\nNilai: ${nilai}`);
  }
}

function resetLatihan() {
  document.querySelectorAll('.latihan-input').forEach((inp) => {
    inp.value = '';
    inp.style.borderColor = '#90caf9';
    inp.style.background = '#fff';
  });
  const hasil = document.getElementById('hasilLatihan');
  if (hasil) hasil.style.display = 'none';
}

/* ============================================================
   LOADER — Hilangkan setelah halaman siap
   ============================================================ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hide'), 500);
  }
});

/* ============================================================
   PROGRESS BAR SCROLL
   ============================================================ */
window.addEventListener('scroll', () => {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = (scrollTop / docHeight) * 100;
  bar.style.width = percent + '%';
});

/* ============================================================
   BACK TO TOP
   ============================================================ */
const backBtn = document.getElementById('backToTop');
if (backBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) backBtn.classList.add('show');
    else backBtn.classList.remove('show');
  });
  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.15 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ===== Counter angka statistik =====
  const counters = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current;
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ===== Set active menu =====
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});

/* ============================================================
   SMOOTH LINK TRANSITION
   ============================================================ */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
  if (link.target === '_blank') return;

  e.preventDefault();
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s';
  setTimeout(() => { window.location.href = href; }, 300);
});
