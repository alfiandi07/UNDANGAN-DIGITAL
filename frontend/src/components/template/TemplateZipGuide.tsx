export default function TemplateZipGuide() {
  return (
    <details className="zip-guide-details">
      <summary className="zip-guide-summary">
        <svg
          className="w-3.5 h-3.5 text-slate-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <span>Lihat Panduan Struktur Folder .ZIP</span>
      </summary>
      <div className="zip-guide-content">
        <pre className="zip-guide-pre">
{`nama-template.zip
├── index.html       (Wajib ada di root zip)
├── style.css        (Style CSS desain)
├── script.js        (Script interaksi / countdown)
└── assets/          (Folder gambar, audio, dll)
    ├── background.jpg
    └── music.mp3`}
        </pre>
        <p className="zip-guide-hint">
          * <strong>Penting:</strong> Path berkas di dalam <code>index.html</code> wajib relatif, contoh: <code>./style.css</code> atau <code>assets/bg.jpg</code> (jangan diawali garis miring <code>/</code>).
        </p>
      </div>
    </details>
  );
}
