import type { Invitation, Rsvp } from "../lib/api";

export const DEMO_INVITATIONS: Record<string, { invitation: Invitation; rsvps: Rsvp[] }> = {
  "jawa-keraton-royal": {
    invitation: {
      id: 991,
      order_id: "DEMO-JAWA-ROYAL",
      slug: "jawa-keraton-royal",
      template_id: 1,
      package_type: "premium",
      max_photos: 30,
      current_photos: 4,
      status: "active",
      expires_at: "2027-12-31T23:59:59.000Z",
      template_title: "Jawa Keraton Royal",
      buyer_name: "Raden Bagas Wicaksono",
      event_details: {
        title: "The Wedding of Bagas & Sekar",
        mempelai: {
          pria: {
            nama: "Raden Bagas Wicaksono, S.T",
            panggilan: "Bagas",
            ayah: "K.R.T. Hardjodiningrat",
            ibu: "Ny. Raden Ayu Hardjodiningrat",
          },
          wanita: {
            nama: "Raden Ayu Sekar Kinanti, S.E",
            panggilan: "Sekar",
            ayah: "K.P.H. Sosronegoro",
            ibu: "Ny. Raden Ayu Sosronegoro",
          },
        },
        akad: {
          tanggal: "2026-12-20",
          jam: "08:00 - 10:00 WIB",
          lokasi: "Pendopo Ageng Pura Mangkunegaran",
          alamat: "Jl. Ronggowarsito No. 83, Keprabon, Banjarsari, Surakarta",
          maps_url: "https://maps.google.com/?q=Pura+Mangkunegaran+Solo",
        },
        resepsi: {
          tanggal: "2026-12-20",
          jam: "11:00 - 14:00 WIB",
          lokasi: "Sasana Handrawina Keraton",
          alamat: "Kompleks Keraton Surakarta Hadiningrat, Jawa Tengah",
          maps_url: "https://maps.google.com/?q=Keraton+Surakarta",
        },
        music_url: "https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-284.mp3",
        amplop: [
          { bank: "Bank BCA", no_rek: "8735019283", atas_nama: "Raden Bagas Wicaksono" },
          { bank: "Bank Mandiri", no_rek: "1370019283719", atas_nama: "Sekar Kinanti" },
        ],
        photos: [
          "/carousel/wedding-flower-veil.png",
          "/carousel/wedding-sunda-siger.jpg",
          "/carousel/wedding-modern.jpg",
          "/carousel/wedding-pastel-hijab.jpg",
        ],
      },
    },
    rsvps: [
      {
        id: 1,
        invitation_id: 991,
        guest_name: "Bambang Soediro & Keluarga",
        attendance: "hadir",
        pax: 2,
        message: "Ndherek bingah dhumateng Mas Bagas & Mbak Sekar. Mugi dados keluarga ingkang sakinah, mawaddah, warahmah.",
      },
      {
        id: 2,
        invitation_id: 991,
        guest_name: "Keluarga Besar Alumni ITB '16",
        attendance: "hadir",
        pax: 3,
        message: "Selamat menempuh hidup baru Bro Bagas! Semoga langgeng dan selalu dilimpahi keberkahan rezeki.",
      },
    ],
  },

  "sunda-siger-luxury": {
    invitation: {
      id: 992,
      order_id: "DEMO-SUNDA-SIGER",
      slug: "sunda-siger-luxury",
      template_id: 2,
      package_type: "premium",
      max_photos: 30,
      current_photos: 4,
      status: "active",
      expires_at: "2027-12-31T23:59:59.000Z",
      template_title: "Sunda Siger Luxury",
      buyer_name: "Kang Fahmi Ramadhan",
      event_details: {
        title: "The Wedding of Fahmi & Amanda",
        mempelai: {
          pria: {
            nama: "M. Fahmi Ramadhan, S.Ds",
            panggilan: "Fahmi",
            ayah: "Bpk. H. Cecep Supriatna",
            ibu: "Ibu Hj. Nenden Kartika",
          },
          wanita: {
            nama: "Amanda Putri Salsabila, S.I.Kom",
            panggilan: "Amanda",
            ayah: "Bpk. Ir. H. Dedi Kurniawan",
            ibu: "Ibu Hj. Rina Marlina",
          },
        },
        akad: {
          tanggal: "2026-11-28",
          jam: "08:00 - 10:00 WIB",
          lokasi: "Masjid Raya Al-Jabbar",
          alamat: "Jl. Cimencrang No. 14, Gedebage, Kota Bandung",
          maps_url: "https://maps.google.com/?q=Masjid+Raya+Al-Jabbar+Bandung",
        },
        resepsi: {
          tanggal: "2026-11-28",
          jam: "11:00 - 15:00 WIB",
          lokasi: "Puri Suryalaya Grand Ballroom",
          alamat: "Jl. Soekarno Hatta No. 487, Batununggal, Kota Bandung",
          maps_url: "https://maps.google.com/?q=Puri+Suryalaya+Bandung",
        },
        music_url: "https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-284.mp3",
        amplop: [
          { bank: "Bank BCA", no_rek: "5221098841", atas_nama: "M. Fahmi Ramadhan" },
          { bank: "Bank BJB", no_rek: "0081273928100", atas_nama: "Amanda Putri Salsabila" },
        ],
        photos: [
          "/carousel/wedding-sunda-siger.jpg",
          "/carousel/wedding-flower-veil.png",
          "/carousel/wedding-pastel-hijab.jpg",
          "/carousel/wedding-modern.jpg",
        ],
      },
    },
    rsvps: [
      {
        id: 1,
        invitation_id: 992,
        guest_name: "Kang Asep Kurnia",
        attendance: "hadir",
        pax: 2,
        message: "Wilujeng ngambah sagara rumah tangga Kang Fahmi & Teh Amanda. Sing runtut raut sauyunan tug dugika paketrok iteuk.",
      },
      {
        id: 2,
        invitation_id: 992,
        guest_name: "Dian & Riza",
        attendance: "hadir",
        pax: 2,
        message: "Barakallahu lakum wa baraka alaikum! Happy wedding Manda cantik!",
      },
    ],
  },

  "modern-minimalist-couture": {
    invitation: {
      id: 993,
      order_id: "DEMO-MODERN-MINIMALIST",
      slug: "modern-minimalist-couture",
      template_id: 3,
      package_type: "standard",
      max_photos: 0,
      current_photos: 0,
      status: "active",
      expires_at: "2027-12-31T23:59:59.000Z",
      template_title: "Modern Minimalist Couture",
      buyer_name: "Kevin Pratama",
      event_details: {
        title: "The Wedding of Kevin & Jessica",
        mempelai: {
          pria: {
            nama: "Kevin Pratama, B.Eng",
            panggilan: "Kevin",
            ayah: "Bpk. Hendra Gunawan",
            ibu: "Ibu Silvia Wijaya",
          },
          wanita: {
            nama: "Jessica Aurelia, B.Com",
            panggilan: "Jessica",
            ayah: "Bpk. William Tanuwijaya",
            ibu: "Ibu Catherine Susanto",
          },
        },
        akad: {
          tanggal: "2026-12-12",
          jam: "09:00 - 10:30 WIB",
          lokasi: "The Glass House Senopati",
          alamat: "Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan",
          maps_url: "https://maps.google.com/?q=Senopati+Jakarta+Selatan",
        },
        resepsi: {
          tanggal: "2026-12-12",
          jam: "18:30 - 21:00 WIB",
          lokasi: "The Grand Lounge SCBD",
          alamat: "SCBD Lot 28, Jl. Jend. Sudirman Kav 52-53, Jakarta Selatan",
          maps_url: "https://maps.google.com/?q=SCBD+Jakarta",
        },
        music_url: "",
        amplop: [
          { bank: "Bank BCA", no_rek: "0182746199", atas_nama: "Kevin Pratama" },
        ],
        photos: [], // Paket Standar: 0 foto
      },
    },
    rsvps: [
      {
        id: 1,
        invitation_id: 993,
        guest_name: "David & Sarah",
        attendance: "hadir",
        pax: 2,
        message: "Wishing you both a lifetime of immense joy, love, and endless happiness! Congrats Kevin & Jess!",
      },
    ],
  },

  "islamic-luxe-andalusia": {
    invitation: {
      id: 994,
      order_id: "DEMO-ISLAMIC-LUXE",
      slug: "islamic-luxe-andalusia",
      template_id: 4,
      package_type: "standard",
      max_photos: 0,
      current_photos: 0,
      status: "active",
      expires_at: "2027-12-31T23:59:59.000Z",
      template_title: "Islamic Luxe Andalusia",
      buyer_name: "Muhammad Farhan",
      event_details: {
        title: "The Wedding of Farhan & Aisyah",
        mempelai: {
          pria: {
            nama: "dr. Muhammad Farhan, Sp.PD",
            panggilan: "Farhan",
            ayah: "Prof. Dr. H. Ahmad Dahlan, Sp.A",
            ibu: "drg. Hj. Siti Zulaikha",
          },
          wanita: {
            nama: "dr. Aisyah Humaira, Sp.A",
            panggilan: "Aisyah",
            ayah: "H. Abdullah Mansyur, Lc., M.A.",
            ibu: "Hj. Ummu Kultsum",
          },
        },
        akad: {
          tanggal: "2026-10-18",
          jam: "08:00 - 10:00 WIB",
          lokasi: "Masjid Raya Pondok Indah",
          alamat: "Jl. Sultan Iskandar Muda No. 1, Kebayoran Lama, Jakarta Selatan",
          maps_url: "https://maps.google.com/?q=Masjid+Raya+Pondok+Indah",
        },
        resepsi: {
          tanggal: "2026-10-18",
          jam: "11:00 - 14:00 WIB",
          lokasi: "Granadi Ballroom 165",
          alamat: "Jl. TB Simatupang Kav. 1, Cilandak Timur, Jakarta Selatan",
          maps_url: "https://maps.google.com/?q=Menara+165+Jakarta",
        },
        music_url: "",
        amplop: [
          { bank: "Bank Syariah Indonesia (BSI)", no_rek: "7129483011", atas_nama: "Muhammad Farhan" },
        ],
        photos: [], // Paket Standar: 0 foto
      },
    },
    rsvps: [
      {
        id: 1,
        invitation_id: 994,
        guest_name: "Ustadz Hilman & Istri",
        attendance: "hadir",
        pax: 2,
        message: "Barakallahu laka wa baraka 'alaika wa jama'a bainakuma fii khoir. Selamat berbahagia dokter Farhan & dokter Aisyah.",
      },
    ],
  },

  "earthy-botanical-warm": {
    invitation: {
      id: 995,
      order_id: "DEMO-EARTHY-BOTANICAL",
      slug: "earthy-botanical-warm",
      template_id: 5,
      package_type: "premium",
      max_photos: 30,
      current_photos: 4,
      status: "active",
      expires_at: "2027-12-31T23:59:59.000Z",
      template_title: "Earthy Botanical Warm",
      buyer_name: "Dimas Ardianto",
      event_details: {
        title: "The Wedding of Dimas & Larasati",
        mempelai: {
          pria: {
            nama: "Dimas Ardianto, S.Ars",
            panggilan: "Dimas",
            ayah: "Bpk. Bambang Sukoco",
            ibu: "Ibu Endang Widyastuti",
          },
          wanita: {
            nama: "Larasati Kusuma, M.Psi",
            panggilan: "Laras",
            ayah: "Bpk. Sigit Purnomo",
            ibu: "Ibu Sri Wahyuni",
          },
        },
        akad: {
          tanggal: "2026-11-15",
          jam: "08:30 - 10:30 WIB",
          lokasi: "Pine Hills Pine Forest",
          alamat: "Jl. Maribaya Timur, Cikidang, Lembang, Bandung Barat",
          maps_url: "https://maps.google.com/?q=Pine+Hills+Lembang",
        },
        resepsi: {
          tanggal: "2026-11-15",
          jam: "15:00 - 18:30 WIB",
          lokasi: "The Rustic Barn Lembang",
          alamat: "Kompleks Maribaya Forest, Lembang, Bandung Barat",
          maps_url: "https://maps.google.com/?q=Lembang+Bandung",
        },
        music_url: "https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-284.mp3",
        amplop: [
          { bank: "Bank BCA", no_rek: "7401928374", atas_nama: "Dimas Ardianto" },
          { bank: "Bank Mandiri", no_rek: "1560029384711", atas_nama: "Larasati Kusuma" },
        ],
        photos: [
          "/carousel/wedding-flower-veil.png",
          "/carousel/wedding-modern.jpg",
          "/carousel/wedding-pastel-hijab.jpg",
          "/carousel/wedding-sunda-siger.jpg",
        ],
      },
    },
    rsvps: [
      {
        id: 1,
        invitation_id: 995,
        guest_name: "Tim Studio Arsitektur Arsa",
        attendance: "hadir",
        pax: 4,
        message: "Selamat menempuh babak baru Mas Dimas & Mbak Laras! Semoga cinta kalian selalu bertumbuh sejuk nan teduh.",
      },
    ],
  },

  "khitan-barokah-ceria": {
    invitation: {
      id: 996,
      order_id: "DEMO-KHITAN-CERIA",
      slug: "khitan-barokah-ceria",
      template_id: 6,
      package_type: "standard",
      max_photos: 0,
      current_photos: 0,
      status: "active",
      expires_at: "2027-12-31T23:59:59.000Z",
      template_title: "Khitan Barokah Ceria",
      buyer_name: "Bpk. H. Ridwan Kamil",
      event_details: {
        title: "Syukuran Khitanan Muhammad Rayyan Al-Ghifari",
        mempelai: {
          pria: {
            nama: "Muhammad Rayyan Al-Ghifari",
            panggilan: "Rayyan",
            ayah: "Bpk. H. Ridwan Pratama",
            ibu: "Ibu Hj. Siti Aisyah",
          },
          wanita: {
            nama: "",
            panggilan: "",
            ayah: "",
            ibu: "",
          },
        },
        akad: {
          tanggal: "2026-12-05",
          jam: "09:00 - 12:00 WIB",
          lokasi: "Kediaman Orang Tua Ananda Rayyan",
          alamat: "Kompleks Permata Indah Blok B3 No. 12, Bekasi Barat",
          maps_url: "https://maps.google.com/?q=Bekasi",
        },
        resepsi: {
          tanggal: "2026-12-05",
          jam: "13:00 - 16:00 WIB",
          lokasi: "Aula Masjid Al-Ikhlas",
          alamat: "Jl. Anggrek Raya No. 1, Bekasi Barat",
          maps_url: "https://maps.google.com/?q=Bekasi",
        },
        music_url: "",
        amplop: [
          { bank: "Bank BSI", no_rek: "7193028472", atas_nama: "H. Ridwan Pratama" },
        ],
        photos: [], // Paket Standar: 0 foto
      },
    },
    rsvps: [
      {
        id: 1,
        invitation_id: 996,
        guest_name: "Om Dani & Tante Maya",
        attendance: "hadir",
        pax: 2,
        message: "Selamat ya jagoan Rayyan sudah dikhitan! Semoga kelak menjadi anak yang sholeh, pintar, dan membanggakan kedua orang tua.",
      },
    ],
  },
};

export function getDemoData(slug: string) {
  // 1. Cari exact match dari key
  if (DEMO_INVITATIONS[slug]) {
    return DEMO_INVITATIONS[slug];
  }

  // 2. Jika slug memiliki format /demo/:slug, bersihkan prefix
  const cleanSlug = slug.replace(/^demo[\/-]/, "");
  if (DEMO_INVITATIONS[cleanSlug]) {
    return DEMO_INVITATIONS[cleanSlug];
  }

  // 3. Fallback default ke template pertama (jawa-keraton-royal)
  return DEMO_INVITATIONS["jawa-keraton-royal"];
}

