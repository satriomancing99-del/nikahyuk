import { getTemplateThumbnail } from '../../../../utils/templateThumbnails';

export const FALLBACK_TEMPLATES = [
  {
    name: 'Klasik Elegant Royal',
    slug: 'classic-silver',
    category: 'Classic',
    price: 0,
    thumbnail_url: getTemplateThumbnail('classic-silver'),
    preview_url: '/preview/classic',
    status: 'active'
  },
  {
    name: 'Classic Royal Gold',
    slug: 'classic-gold',
    category: 'Classic',
    price: 99000,
    thumbnail_url: getTemplateThumbnail('classic-gold'),
    preview_url: '/preview/classic',
    status: 'active'
  },
  {
    name: 'Classic Obsidian Velvet',
    slug: 'classic-platinum',
    category: 'Classic',
    price: 149000,
    thumbnail_url: getTemplateThumbnail('classic-platinum'),
    preview_url: '/preview/classic',
    status: 'active'
  },
  {
    name: 'Rustic Warm Autumn',
    slug: 'rustic-silver',
    category: 'Rustic',
    price: 0,
    thumbnail_url: getTemplateThumbnail('rustic-silver'),
    preview_url: '/preview/rustic',
    status: 'active'
  },
  {
    name: 'Rustic Modern Botanical',
    slug: 'rustic',
    category: 'Rustic',
    price: 99000,
    thumbnail_url: getTemplateThumbnail('rustic'),
    preview_url: '/preview/rustic',
    status: 'active'
  },
  {
    name: 'Rustic Whispering Pines',
    slug: 'rustic-platinum',
    category: 'Rustic',
    price: 149000,
    thumbnail_url: getTemplateThumbnail('rustic-platinum'),
    preview_url: '/preview/rustic',
    status: 'active'
  },
  {
    name: 'Minimalist Clean Slate',
    slug: 'minimalist-silver',
    category: 'Minimalist',
    price: 0,
    thumbnail_url: getTemplateThumbnail('minimalist-silver'),
    preview_url: '/preview/minimalist',
    status: 'active'
  },
  {
    name: 'Minimalist Bento Grid',
    slug: 'minimalist-gold',
    category: 'Minimalist',
    price: 99000,
    thumbnail_url: getTemplateThumbnail('minimalist-gold'),
    preview_url: '/preview/minimalist',
    status: 'active'
  },
  {
    name: 'Minimalist Premium Gold',
    slug: 'minimalist',
    category: 'Minimalist',
    price: 149000,
    thumbnail_url: getTemplateThumbnail('minimalist'),
    preview_url: '/preview/minimalist',
    status: 'active'
  },
  {
    name: 'Islamic White Jasmine',
    slug: 'islamic-silver',
    category: 'Islamic',
    price: 0,
    thumbnail_url: getTemplateThumbnail('islamic-silver'),
    preview_url: '/preview/islamic',
    status: 'active'
  },
  {
    name: 'Islamic Sakura Rahmat',
    slug: 'islamic',
    category: 'Islamic',
    price: 99000,
    thumbnail_url: getTemplateThumbnail('islamic'),
    preview_url: '/preview/islamic',
    status: 'active'
  },
  {
    name: 'Islamic Emerald Arch',
    slug: 'islamic-platinum',
    category: 'Islamic',
    price: 149000,
    thumbnail_url: getTemplateThumbnail('islamic-platinum'),
    preview_url: '/preview/islamic',
    status: 'active'
  },
  {
    name: 'Floral Sweet Lavender',
    slug: 'floral-silver',
    category: 'Floral',
    price: 0,
    thumbnail_url: getTemplateThumbnail('floral-silver'),
    preview_url: '/preview/floral',
    status: 'active'
  },
  {
    name: 'Floral Garden Rose',
    slug: 'floral-gold',
    category: 'Floral',
    price: 99000,
    thumbnail_url: getTemplateThumbnail('floral-gold'),
    preview_url: '/preview/floral',
    status: 'active'
  },
  {
    name: 'Floral Watercolor Blossom',
    slug: 'floral',
    category: 'Floral',
    price: 149000,
    thumbnail_url: getTemplateThumbnail('floral'),
    preview_url: '/preview/floral',
    status: 'active'
  },
  {
    name: 'Elegance Typique Minimalist',
    slug: 'elegance-typique',
    category: 'Typography',
    price: 0,
    thumbnail_url: getTemplateThumbnail('elegance-typique'),
    preview_url: '/preview/elegance-typique',
    status: 'active'
  }
];

export const RELIGION_PRESETS = {
  Islam: {
    greeting: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
    quote: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir. (Ar-Rum: 21)"
  },
  Kristen: {
    greeting: "Salam Sejahtera dalam Kasih Tuhan Yesus Kristus",
    quote: "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia. (Matius 19:6)"
  },
  Katolik: {
    greeting: "Salam Sejahtera dalam Kasih Kristus",
    quote: "Dan di atas semuanya itu: kenakanlah kasih, sebagai pengikat yang mempersatukan dan menyempurnakan. (Kolose 3:14)"
  },
  Hindu: {
    greeting: "Om Swastyastu",
    quote: "Semoga sepasang mempelai ini selalu setia satu sama lain, tidak terpisahkan, dan menikmati kehidupan yang penuh kebahagiaan bersama keturunan mereka di rumah yang damai. (Rig Veda X.85.42)"
  },
  Buddha: {
    greeting: "Namo Buddhaya",
    quote: "Pikiran yang diarahkan secara benar akan membimbing seseorang menuju kebahagiaan dan harmoni dalam hidup bersama, seperti bunga yang indah dan semerbak wanginya. (Dhammapada)"
  },
  Nasional: {
    greeting: "Salam Sejahtera bagi Kita Semua",
    quote: "Pernikahan bukanlah tentang menemukan seseorang yang sempurna untuk hidup bersama, melainkan tentang belajar melihat keindahan dalam ketidaksempurnaan dan berjalan beriringan dengan penuh kasih sayang."
  }
};

export const base64ToFile = (base64Str: string, filename: string): File | null => {
  if (!base64Str || !base64Str.startsWith('data:image/')) return null;
  try {
    const arr = base64Str.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    console.error('Error converting base64 to file:', e);
    return null;
  }
};

export const fileToOptimizedBase64 = (file: File, maxDim = 500): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = (maxDim / w) * h;
            w = maxDim;
          } else {
            w = (maxDim / h) * w;
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve('');
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};
