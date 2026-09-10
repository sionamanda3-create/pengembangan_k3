// ===== KUIS: Simpan jawaban & hitung skor =====
const kunciJawaban = {
  q1: 'b', q2: 'c', q3: 'a', q4: 'd', q5: 'b',
  q6: 'a', q7: 'c', q8: 'b', q9: 'd', q10: 'a'
};

function submitKuis() {
  let benar = 0;
  let total = Object.keys(kunciJawaban).length;

  for (let key in kunciJawaban) {
    const dipilih = document.querySelector(`input[name="${key}"]:checked`);
    if (dipilih && dipilih.value === kunciJawaban[key]) benar++;
  }

  const skor = Math.round((benar / total) * 100);
  localStorage.setItem('skorK3', skor);
  localStorage.setItem('benarK3', benar);
  localStorage.setItem('totalK3', total);

  window.location.href = 'hasil.html';
}

// ===== TAMPILKAN HASIL =====
function tampilkanHasil() {
  const skor = localStorage.getItem('skorK3') || 0;
  const benar = localStorage.getItem('benarK3') || 0;
  const total = localStorage.getItem('totalK3') || 10;

  document.getElementById('skor').textContent = skor;
  document.getElementById('detail').textContent = `Benar ${benar} dari ${total} soal`;

  const status = document.getElementById('status');
  if (skor >= 75) {
    status.textContent = '✅ LULUS';
    status.className = 'status lulus';
  } else {
    status.textContent = '❌ BELUM LULUS';
    status.className = 'status gagal';
  }
}

// ===== LATIHAN: cek jawaban essay singkat =====
function cekLatihan() {
  const jawaban = document.querySelectorAll('.latihan-input');
  let benar = 0;
  jawaban.forEach((inp) => {
    const kunci = inp.dataset.kunci.toLowerCase().split('|');
    const val = inp.value.trim().toLowerCase();
    if (kunci.includes(val)) {
      inp.style.borderColor = '#4caf50';
      benar++;
    } else {
      inp.style.borderColor = '#f44336';
    }
  });
  alert(`Jawaban benar: ${benar} dari ${jawaban.length}`);
}

// ===== Set active menu =====
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});
