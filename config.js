/* ============================================================
   SILVERHOLD PORTAL — CONFIG
   File ini berisi SEMUA pengaturan portal.
   Edit di sini saja, jangan edit index.html.
   ============================================================ */

const CONFIG = {

    // ============================================
    // IDENTITAS PORTAL
    // ============================================
    title:        'Silverhold Portal',
    subtitle:     'Server Monitoring System',
    footerText:   'Silverhold Panel · GitHub Pages Portal',
    enterBtnText: 'Masuk Panel',

    // ============================================
    // ASSET (LOGO & BACKGROUND)
    // ============================================
    logo:       'https://litter.catbox.moe/3h6b0h.jpg',
    background: 'https://litter.catbox.moe/ms4fcd.jpg',

    // ============================================
    // TUNNEL — URL XAMPP ANDA
    // GANTI DENGAN URL TUNNEL ANDA!
    // Contoh:
    //   'https://abc123.ngrok-free.app'
    //   'https://xyz.trycloudflare.com'
    //   'https://mytunnel.local'
    // ============================================
    tunnelUrl:   'https://your-tunnel-url.example.com',
    tunnelLabel: 'Tunnel Endpoint',
    openInNewTab: true, // true = buka tab baru, false = redirect

    // ============================================
    // WARNA TEMA (ACCENT)
    // ============================================
    colors: {
        accent1:          '#38bdf8',
        accent2:          '#0ea5e9',
        accent3:          '#7dd3fc',
        accentBorder:     'rgba(56,189,248,0.5)',
        accentBg:         'rgba(56,189,248,0.1)',
        accentGlow:       'rgba(56,189,248,0.5)',
        accentGlowStrong: 'rgba(56,189,248,0.9)',
        accentBtnBg:      'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.2))',
        accentGlowOverlay:'rgba(56,189,248,0.15)'
    },

    // ============================================
    // LOADING STAGES
    // ============================================
    stages: [
        { pct: 15,  stage: 'INITIALIZING', status: 'Memuat konfigurasi portal...' },
        { pct: 35,  stage: 'CONNECTING',   status: 'Menghubungkan ke server tunnel...' },
        { pct: 55,  stage: 'HANDSHAKE',    status: 'Melakukan handshake...' },
        { pct: 75,  stage: 'VERIFYING',    status: 'Memverifikasi endpoint...' },
        { pct: 92,  stage: 'FINALIZING',   status: 'Menyiapkan akses panel...' },
        { pct: 100, stage: 'READY',        status: 'Portal siap. Klik Masuk Panel.' }
    ],

    // ============================================
    // TIMING (ms)
    // ============================================
    stageDelayMin: 500,
    stageDelayMax: 1000,
    startDelay:    300
};
