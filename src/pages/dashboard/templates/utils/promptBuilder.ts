export const buildPrompt = (tier: 'silver' | 'gold' | 'platinum' | 'typography'): string => {
  let priceText = '99000';
  let photoLimitText = 'Maksimal 8 Foto saja (slice array gallery ke maks 8 data, contoh: gallery?.slice(0, 8).map(...)).';
  let bgmText = '- mempelai?.music_url (URL berkas latar musik .mp3 hasil pilihan atau unggahan manual kustomer. Wajib gunakan variabel ini untuk memutar musik latar kustomer! Sediakan URL musik instrumen romantis premium sebagai fallback pertahanan jika variabel ini null.)';
  let giftText = '- gifts (Array rekening/hadiah amplop digital):\n  * Map hadiah mempelai: gifts?.map(gift => ...)\n  * Sediakan tombol "Salin Rekening" bertuliskan Copy yang menyalin gift.account_number ke clipboard tamu secara mulus.';
  let eGiftSection = '- **E-Gift & Kado Amplop Digital**: Kotak rekening digital kustomer lengkap dengan tombol instan untuk menyalin nomor rekening ke clipboard secara mulus.';
  let watermarkText = '';

  if (tier === 'silver') {
    priceText = '49000';
    photoLimitText = 'Maksimal 3 Foto saja (slice array gallery ke maks 3 data, contoh: gallery?.slice(0, 3).map(...)).';
    bgmText = '- mempelai?.music_url (URL berkas latar musik .mp3 hasil pilihan atau unggahan manual kustomer. Wajib gunakan variabel ini untuk memutar musik latar kustomer! Sediakan URL musik instrumen romantis premium sebagai fallback pertahanan jika variabel ini null.)';
    giftText = 'DILARANG keras menampilkan/menghubungkan modul Rekening Amplop/E-Gift maupun properti gifts! Paket ini tidak menyediakan amplop digital.';
    eGiftSection = 'DILARANG keras membuat atau menampilkan bagian E-Gift/Kado digital!';
  } else if (tier === 'platinum') {
    priceText = '149000';
    photoLimitText = 'Maksimal 12 Foto saja (slice array gallery ke maks 12 data, contoh: gallery?.slice(0, 12).map(...)).';
    bgmText = '- mempelai?.music_url (URL berkas latar musik .mp3 hasil pilihan atau unggahan manual kustomer. Wajib gunakan variabel ini untuk memutar musik latar kustomer! Sediakan URL musik instrumen romantis premium sebagai fallback pertahanan jika variabel ini null.) + Sediakan tombol putar suara sambutan kustom kustomer bila tersedia.';
    watermarkText = '- DILARANG KERAS menampilkan logo, nama, atau identitas platform NikahYuk! di layar visual kustomer. Template Platinum harus 100% bersih tanpa watermark branding platform!';
  } else if (tier === 'typography') {
    priceText = '0';
    photoLimitText = 'DILARANG KERAS merender foto profil mempelai, foto utama, maupun seksi galeri prewedding! Paket ini didesain 100% murni berbasis keindahan tipografi artistik (Pure Typographic) untuk kustomer yang tidak ingin mengunggah foto.';
    bgmText = '- mempelai?.music_url (URL berkas latar musik .mp3 hasil pilihan atau unggahan manual kustomer. Wajib gunakan variabel ini untuk memutar musik latar kustomer! Sediakan URL musik instrumen romantis premium sebagai fallback pertahanan jika variabel ini null.)';
    giftText = '- gifts (Array rekening/hadiah amplop digital):\n  * Map hadiah mempelai: gifts?.map(gift => ...)\n  * Sediakan tombol "Salin Rekening" bertuliskan Copy yang menyalin gift.account_number ke clipboard tamu secara mulus.';
    eGiftSection = '- **E-Gift & Kado Amplop Digital**: Kotak rekening digital kustomer lengkap dengan tombol instan untuk menyalin nomor rekening ke clipboard secara mulus.';
    watermarkText = `* **LOGIKA TANPA GAMBAR (STRICTLY NO-IMAGE DESIGN)**:
    - JANGAN merender tag <img> untuk profil mempelai pria, wanita, cover depan, maupun galeri!
    - DILARANG KERAS merender placeholder avatar, lingkaran inisial huruf, kotak inisial, maupun ornamen berbentuk bingkai foto di bagian detail mempelai pria dan wanita! Di seksi profil mempelai, HANYA tampilkan nama mempelai (groom_name, bride_name) dan nama orang tua kustomer secara murni berbasis keindahan teks tipografi (Pure Typography) tanpa ada lingkaran/kotak tempat avatar sama sekali!
    - Untuk seksi cover pembuka depan & hero banner: Gunakan ornamen visual murni berbasis CSS/SVG (garis pembatas ultra-tipis, ornamen bunga SVG halus, garis lengkung artistik, atau pola gradien mewah) untuk menyelimuti nama mempelai agar terlihat megah dan estetik tanpa gambar latar belakang.
    - Seksi Galeri Prewedding wajib disembunyikan sepenuhnya!
    - Kategori config.json wajib diisi: "Typography"`;
  }

  return `Anda adalah AI developer ahli pembuat UI template undangan pernikahan digital berstandar premium dunia. Tugas Anda adalah menghasilkan KODE SUMBER KOMPONEN REACT (.jsx) dan berkas METADATA (.json) yang dirancang khusus untuk diimpor ke platform kami dalam satu paket ZIP.

Paket ZIP yang Anda hasilkan WAJIB berisi 3 berkas utama:
1. "config.json" (Berkas konfigurasi template)
2. "template.jsx" (Kode sumber komponen React premium)
3. "thumbnail.png" atau "thumbnail.jpg" (Gambar pratinjau berupa Phone Mockup premium yang elegan, menampilkan visual layar HP dengan isi undangan di dalamnya dan berlatar belakang artistik yang kontras. DILARANG keras menggunakan ilustrasi kartun/gambar pasangan pengantin biasa, melainkan wajib mockup perangkat HP profesional.)

Berikut adalah petunjuk teknis super-detail agar template yang dihasilkan 100% kompatibel dengan database kami, rapi, responsif, dan sangat mewah:

1. KETENTUAN BERKAS CONFIG.JSON:
Tulis konfigurasi metadata template Anda dengan format JSON berikut:
{
  "name": "[Nama Desain Premium - Contoh: Eternal Sakura Premium]",
  "category": "Classic | Rustic | Minimalist | Modern | Islamic | Floral | Premium",
  "price": ${priceText},
  "slug": "[slug-unik-huruf-kecil-dan-minus - Contoh: eternal-sakura-premium]",
  "thumbnail_url": "thumbnail.png",
  "preview_url": "/preview/[slug-unik-anda]"
}

2. DESAIN ESTETIKA & DIVERSIFIKASI LAYOUT (AESTHETIC & DIVERSE DESIGN GUIDELINES):
- **PETUNJUK TEMA UNIVERSAL (PENTING)**: Secara default, buatlah tema desain yang universal, netral, dan cocok untuk seluruh agama/tradisi (seperti Classic, Rustic, Floral, atau Minimalist) dengan kutipan cinta/pernikahan yang romantis secara universal, KECUALI jika pengguna secara spesifik meminta tema keagamaan tertentu (seperti Islamic).
- JANGAN terpaku pada 1 model desain standar. Buatlah desain, struktur layout, kombinasi warna, border-radius, font, gaya ornamen visual, ornamen dekoratif, grid foto (hindari tata letak baris kotak seragam yang monoton dan membosankan), bingkai foto dan transisi yang SEPENUHNYA UNIK, berbeda, inovatif, dan berkelas dunia untuk setiap kategori:
  * **Rustic/Botanical**: Gunakan earthy tones (cokelat pasir, krem lembut, hijau zaitun), font serif bernuansa klasik, dekorasi botani minimalis, border melengkung organik yang halus, dan nuansa kertas daur ulang bertekstur.
  * **Minimalist/Bento-Grid**: Tata letak asimetris kontemporer berbasis kotak (bento-style grid) tanpa border melingkar kasar, menggunakan ruang putih (white space) yang luas, tipografi sans-serif uppercase tipis pelengkap, dan skema warna monokromatik modern berserat mewah.
  * **Islamic/Arabesque**: Gabungkan ornamen kubah masjid halus, pola geometris islami (Arabesque), latar belakang hijau emerald tua yang berpadu dengan aksen emas bercahaya premium.
  * **Floral/Soft Romantic**: Didominasi sapuan cat air bunga pastel (mawar lembut, cherry blossom), font kaligrafi meliuk anggun, dan transisi fade-in memudar yang lambat and romantis.
  * **Elegant Premium Dark Mode**: Menggunakan latar belakang gelap pekat (charcoal, obsidian, deep space) dengan kontras tinggi dari teks and ornamen bergradasi emas berkilau mewah serta pembatas garis ultra-tipis yang futuristik.
- JANGAN PERNAH menggunakan animasi loop berulang (seperti \`repeat: Infinity\`) pada elemen teks statis seperti judul bagian ("Momen Bahagia", "Countdown Pernikahan", dll.), nama mempelai, kutipan, dan teks detail. Animasi loop berulang membuat teks berkedip (blink) terus-menerus dan merusak estetika premium. Semua teks hanya boleh memiliki animasi masuk (entrance animation) SEKALI saat pertama kali dimunculkan di layar.
- STRUKTUR KODE REACT YANG BENAR: JANGAN mendefinisikan komponen React lain di dalam fungsi komponen utama Anda (Nested Component Declarations). Mendeklarasikan komponen di dalam komponen lain akan merusak Virtual DOM React, memaksa DOM ter-mount ulang secara penuh pada setiap perubahan status (seperti setiap detik saat hitung mundur diperbarui), yang mengakibatkan animasi masuk terpipu berulang kali dan teks berkedip secara konstan (flashing/blinking). Semua sub-bagian wajib ditulis langsung di dalam badan render utama atau dideklarasikan sebagai fungsi pembantu standar di luar komponen utama!
- PENGATURAN ORIENTASI & ASPEK RASIO FOTO (DEFENSIVE IMAGE HANDLING):
  * Semua tag \`<img>\` wajib memiliki class \`object-cover\` dan \`w-full h-full\` agar gambar tidak pernah gepeng atau distorsi (stretched) saat orientasi foto kustomer (misalnya potret/berdiri) berbeda dengan bingkai di template (misalnya lanskap/tidur).
  * Khusus untuk bingkai foto profil mempelai (yang biasanya berorientasi potret/berdiri) atau cover utama: JANGAN gunakan bingkai lanskap tipis yang memotong foto terlalu ekstrem. Direkomendasikan menggunakan bingkai ber-aspek rasio fleksibel (seperti kotak \`aspect-square\`, lingkaran sempurna \`rounded-full\`, atau potret \`aspect-[3/4]\`), ATAU gunakan teknik blur-cadangan premium (gambar utama diposisikan \`object-contain\` di tengah bingkai, sedangkan di latar belakangnya diposisikan duplikat gambar yang sama dengan class \`absolute inset-0 w-full h-full object-cover filter blur-xl opacity-30\`). Teknik blur-cadangan ini menjamin seluruh foto kustomer (berdiri maupun lanskap) tampil penuh dengan estetika mewah berkelas dunia.

3. DAFTAR PARAMETER DATABASE (DEFENSIVE EXTRACTION):
Komponen React Anda akan menerima properti database berikut:
{ mempelai, events, gifts, gallery, wishes, guest }
Agar tidak terjadi error "Cannot read properties of undefined", wajib gunakan optional chaining (?.) untuk seluruh akses data:
- mempelai: 
  * mempelai?.groom_name (Nama mempelai pria, default: "Aditya Pratama")
  * mempelai?.groom_parent (Orang tua pria, default: "Bpk. Heri Pratama & Ibu Shinta")
  * mempelai?.bride_name (Nama mempelai wanita, default: "Aulia Rahmawati")
  * mempelai?.bride_parent (Orang tua wanita, default: "Bpk. Ahmad Rahmawan & Ibu Lestari")
  * mempelai?.quote (Kutipan doa/cinta, default: "Hari ini kami memulai perjalanan baru bersama, menyatukan dua hati dalam cinta, rasa syukur, dan harmoni selamanya...")
  * mempelai?.greeting (Salam pembuka keagamaan/universal kustomer, default: "Selamat Pagi/Siang/Sore/Malam, dengan penuh rasa syukur dan bahagia...". Wajib gunakan variabel ini agar seksi greeting/salam pembuka di undangan dinamis mengikuti agama/tradisi kustomer!)
  * mempelai?.love_story (Kisah cinta pasangan)
  * mempelai?.music_url ${bgmText}
  * mempelai?.thumbnail_url (PENTING: Ini adalah URL foto utama/cover utama hasil upload customer. Gunakan sebagai latar belakang cover utama, hero banner, atau cover pembuka undangan.)
  * **Foto Profil Masing-Masing Mempelai (Krusial untuk Detail Pasangan):** DILARANG KERAS menggunakan mempelai?.thumbnail_url untuk foto profil pria dan wanita secara bersamaan. Foto masing-masing mempelai harus diambil secara dinamis dari properti \`gallery\` (lihat panduan ekstraksi di bawah). Gunakan mempelai?.thumbnail_url hanya sebagai fallback jika foto spesifik tidak ditemukan di gallery.
- events (Array agenda acara):
  * Gunakan: const akad = events?.find(e => e.type === 'akad' || e.title?.toLowerCase().includes('akad'))
  * Gunakan: const resepsi = events?.find(e => e.type === 'resepsi' || e.title?.toLowerCase().includes('resepsi'))
  * Tampilkan format tanggal dengan rapi (contoh: "Sabtu, 27 Mei 2026"), jam ("09:00 - 11:00 WIB"), nama tempat ("Grand Ballroom"), dan alamat lengkap.
- guest (Data tamu undangan personal - CRITICAL!):
  * Wajib gunakan: guest?.name (Nama tamu personal, default fallback jika null: "Tamu Terhormat"). Tampilkan nama ini di kotak penutup/cover depan secara elegan!
  * Sediakan Form Kehadiran (RSVP) DAN Form Kirim Ucapan / Buku Tamu (Wish Form) yang fungsional dan bernuansa premium.
  * PENTING: Untuk kedua formulir tersebut (RSVP & Buku Tamu), jika data guest tersedia (tamu mengakses via link personal), input "Nama Tamu" WAJIB dibuat read-only atau disabled dengan style visual yang jelas (seperti background abu-abu & kursor tidak bisa diklik), serta otomatis terisi nilai \`guest.name\` agar tidak bisa dirubah secara manual oleh pengunjung. Ini krusial demi menjaga integritas data daftar tamu yang diimpor dari CSV atau daftar kustom yang sudah dibuat oleh customer!
- gifts (Array rekening/hadiah amplop digital):
  ${giftText}
- gallery (Array foto dari database, berisi foto profil mempelai dan foto prewedding):
  * **PENTING: Ekstraksi Foto Profil Mempelai Secara Spesifik (Wajib Diikuti!):**
    * **Foto Profil Pria (Groom Photo):** Wajib diekstrak dari gallery menggunakan filter caption 'groom_photo':
      \`const groomPhoto = gallery?.find(img => img.caption === 'groom_photo')?.url || mempelai?.thumbnail_url;\`
    * **Foto Profil Wanita (Bride Photo):** Wajib diekstrak dari gallery menggunakan filter caption 'bride_photo':
      \`const bridePhoto = gallery?.find(img => img.caption === 'bride_photo')?.url || mempelai?.thumbnail_url;\`
  * **PENTING: Pemisahan Galeri Prewedding (Wajib Diikuti!):**
    * Saat merender blok galeri prewedding (grid foto kustomer), Anda **WAJIB MENYARING KELUAR** (exclude) foto profil mempelai agar foto profil tidak muncul ganda di galeri prewedding.
    * Gunakan filter berikut sebelum merender galeri prewedding:
      \`const preweddingImages = gallery?.filter(img => img.caption !== 'groom_photo' && img.caption !== 'bride_photo') || [];\`
    * Lakukan render/mapping dari variabel \`preweddingImages\` yang sudah disaring tersebut, bukan dari array raw \`gallery\`!
  * **Urutan Foto Galeri Prewedding Berdasarkan Input Kustomer (Krusial!):** Data dalam array \`preweddingImages\` diurutkan secara berurutan sesuai urutan unggahan kustomer di dashboard:
    * \`preweddingImages?.[0]\` = Foto Prewedding Ke-1
    * \`preweddingImages?.[1]\` = Foto Prewedding Ke-2
    * \`preweddingImages?.[2]\` = Foto Prewedding Ke-3
    * dan seterusnya.
  * **PENTING: DESAIN LAYOUT GALERI BUKAN GRID DATAR MONOTON!** DILARANG KERAS merender foto prewedding hanya berupa barisan kotak-kotak berukuran seragam (seperti kotak persegi 1x1 berurutan dalam satu baris datar yang membosankan dan terlihat amatir).
  * **Wajib Gunakan Layout Artistik Variatif Sesuai Urutan:**
    * *Asymmetric Bento Grid*: Wajib gunakan foto prewedding pertama (\`preweddingImages?.[0]\`) sebagai elemen utama yang paling besar (\`col-span-2 row-span-2\` atau \`aspect-[4/3]\` besar), lalu kelilingi dengan foto-foto berikutnya (\`preweddingImages?.[1]\`, \`preweddingImages?.[2]\`, dst.) sebagai elemen pendukung yang lebih kecil (\`col-span-1\`). Ini menjamin foto utama kustomer tampil paling megah di tata letak bento modern.
    * *Staggered Masonry / Alternating Heights*: Susun foto secara berurutan (\`preweddingImages?.[0]\`, \`preweddingImages?.[1]\`, dst.) dengan tinggi bergantian atau offset margin asimetris agar urutan alur unggahan terasa natural dan estetik saat discroll.
    * *Artistic Staggered Collage (Polaroid Style)*: Susun kolase bertumpuk secara estetis berdasarkan urutan indeks, berikan kemiringan rotasi acak yang halus (contoh: \`rotate-1\`, \`-rotate-2\`, \`hover:rotate-0 transition duration-300\`) di mana foto pertama (\`preweddingImages?.[0]\`) menempati posisi terdepan/teratas.
    * *Interactive Carousel & Highlight Slider*: Jadikan foto prewedding pertama (\`preweddingImages?.[0]\`) sebagai gambar utama yang langsung aktif pertama kali di layar, dengan barisan thumbnail berurutan di bawahnya.
  * Gunakan mapping secara kreatif untuk merender elemen gambar prewedding secara murni: preweddingImages?.map(img => <img src={img.url} />)
  * PENTING: Blok galeri prewedding hanya boleh menampilkan elemen gambar <img> saja. DILARANG KERAS merender caption, deskripsi, overlay teks, atau tulisan keterangan apa pun baik dinamis maupun statis (seperti menuliskan teks penjelasan desain atau deskripsi visual tata letak).
  * Batasan Jumlah Foto Prewedding: ${photoLimitText}
- wishes (Array ucapan doa restu dari para tamu):
  * Tampilkan daftar ucapan secara bergulir (scrollable feed) yang menarik. Sediakan form input cepat untuk memposting ucapan (nama & teks ucapan).

4. GAMBARAN BESAR STRUKTUR KONTEN & INTERAKTIF (THE BIG PICTURE OF REQUIRED SECTIONS):
Anda dibebaskan menyusun layout, hierarki visual, warna, dan kombinasi animasi secara sekreatif mungkin, namun secara garis besar wajib menyajikan blok interaktif berikut:
- **Cover Welcome Overlay**: Layar sambutan awal yang menghalangi konten utama sebelum diklik. Menampilkan nama mempelai, nama personal tamu kustom (\`guest?.name || 'Tamu Terhormat'\`), dan tombol pembuka undangan interaktif. Ketika tombol diklik, gerbang cover meluncur ke atas (*slide-up*) dengan transisi super-halus dan memicu musik latar kustomer (\`mempelai?.music_url\`) berputar otomatis secara *looping*.
- **Floating Audio Controller**: Tombol lingkaran mengambang elegan di sudut layar yang memungkinkan pengunjung memutar/menjeda (*play/pause*) musik latar kapan saja.
- **Hero & Countdown Banner**: Sapaan megah nama mempelai berhias ornamen dekoratif/grafis yang disesuaikan dengan tema visual terpilih, dilengkapi modul hitung mundur dinamis menuju hari akad pernikahan.
- **Profil Pasangan Mempelai**: Kartu profil personal mempelai pria dan wanita yang rapi lengkap dengan nama orang tua, menggunakan foto profil kustomer pria (\`gallery?.find(img => img.caption === 'groom_photo')?.url\` dengan fallback \`mempelai?.thumbnail_url\`) dan foto profil kustomer wanita (\`gallery?.find(img => img.caption === 'bride_photo')?.url\` dengan fallback \`mempelai?.thumbnail_url\`).
- **Informasi Acara (Events)**: Menyajikan detail waktu, hari-H, alamat, dan tombol rute menuju Google Maps (\`google_maps_url\`) secara responsif.
- **Form RSVP & Kirim Ucapan Terkunci**: Panel di mana tamu dapat mengonfirmasi status kedatangan dan mengetikkan ucapan selamat dengan kolom nama yang dikunci aman.
- **Galeri Foto Bersih**: Cukup tampilkan deretan foto prewedding hasil upload kustomer dalam kontainer grid responsif yang estetis. PENTING: Kontainer galeri ini hanya boleh berisi gambar saja, tanpa ada teks penjelasan, keterangan layout, atau caption sama sekali di layar!
- **E-Gift & Kado Amplop Digital**: ${eGiftSection}

5. WATERMARK & BRANDING PLATFORM:
${watermarkText || '- Sediakan credit watermark berupa tautan "NikahYuk!" secara minimalis, bersih, dan estetis di footer paling bawah undangan.'}

6. STANDAR KEBERSIHAN TEKS & HALANGAN PLACEHOLDER (STRICT NO-PROSE / NO-PLACEHOLDER RULES):
- DILARANG KERAS menampilkan kalimat penjelasan desain, kalimat petunjuk prompt, atau teks meta-instruksi apa pun di layar undangan kustomer.
- Contoh teks yang HARAM dan DILARANG KERAS untuk ditulis/dirender di HTML/JSX visual:
  * "Foto ditampilkan bersih tanpa caption dalam susunan woodland bento yang organik dan responsif."
  * "Foto tampil bersih tanpa caption dalam galeri bento asimetris dengan bingkai organik."
  * Istilah deskripsi tata letak seperti "woodland bento", "bento asimetris", "bingkai organik", "desain bersih tanpa caption", atau sejenisnya.
- Kalimat-kalimat di atas adalah instruksi logika koding bagi Anda (AI), bukan teks pengisi (placeholder) yang harus dibaca oleh tamu undangan. Layar undangan hanya boleh menampilkan judul bagian standar yang bersih (misal: "Galeri Foto", "Momen Bahagia", dll.) dan data asli dari database. JANGAN PERNAH menyelipkan teks deskripsi visual ke dalam tag JSX.

7. LOGIKA SMART AUTO-HIDE SEKSI OPSIONAL (SMART SECTION TOGGLES):
- Selalu lakukan pengecekan keberadaan data kustomer secara dinamis sebelum merender seluruh kontainer seksi opsional demi menjaga visual premium:
  * **Kisah Cinta (Love Story)**: Wajib dibungkus dengan pemeriksaan kondisional: \`mempelai?.love_story && ( <section>...</section> )\`. Jika kustomer tidak mengisi kisah cinta (bernilai null, undefined, atau string kosong), seksi Kisah Cinta **wajib disembunyikan sepenuhnya** (tidak dirender sama sekali di DOM), bukan memunculkan seksi kosong dengan judul hampa.
  * **Galeri Prewedding**: Lakukan pengecekan terhadap array hasil saringan foto prewedding: \`preweddingImages && preweddingImages.length > 0 && ( <section>...</section> )\`. Jika kustomer tidak mengunggah foto prewedding sama sekali (array bernilai kosong / 0 data), seksi Galeri Foto **wajib disembunyikan sepenuhnya** dari layar agar tidak merusak tata letak typographic yang bersih.
  * **Kado Amplop / E-Gift**: Jika kustomer tidak mengonfigurasi rekening atau hadiah sama sekali, atau array \`gifts\` bernilai kosong (\`!gifts || gifts.length === 0\`), seksi kado amplop digital **wajib disembunyikan sepenuhnya** dari hadapan tamu.

8. ATURAN PENULISAN KODE TEMPLATE.JSX:
- Tulis seluruh kode komponen dalam SATU file tunggal ("template.jsx").
- Gunakan export default tunggal (misal: export default function InvitationComponent(...) or export default class ...).
- Import icon Lucide hanya dari 'lucide-react' (contoh: import { Heart, Calendar, MapPin, Gift, Clock, Copy, Check, Volume2, VolumeX, MailOpen } from 'lucide-react';).
- Import animasi motion hanya dari 'motion/react' (contoh: import { motion, AnimatePresence } from 'motion/react';).`;
};
