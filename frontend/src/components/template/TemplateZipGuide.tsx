export default function TemplateZipGuide() {
  return (
    <details className="mt-2 text-xs border-t border-amber-200/60 pt-2">
      <summary className="cursor-pointer text-[#4A151E] hover:underline font-semibold flex items-center gap-1 select-none">
        <span>📁 Lihat Panduan Struktur Folder .ZIP</span>
      </summary>
      <div className="mt-2 p-3 bg-gray-900 text-gray-200 rounded-lg text-[11px] font-mono border border-gray-700">
        <pre className="text-emerald-400">
{`nama-template.zip
├── index.html       ⭐ (Wajib ada di root zip)
├── style.css        (Style CSS desain)
├── script.js        (Script interaksi / countdown)
└── assets/          (Folder gambar, musik, audio)
    ├── background.jpg
    └── music.mp3`}
        </pre>
        <p className="mt-2 text-[10px] text-amber-300 font-sans leading-tight">
          * <strong>Penting:</strong> Path berkas di dalam <code>index.html</code> wajib relatif, contoh: <code>./style.css</code> atau <code>assets/bg.jpg</code> (jangan diawali tanda <code>/</code>).
        </p>
      </div>
    </details>
  );
}

