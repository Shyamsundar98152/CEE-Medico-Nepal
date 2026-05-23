// =============================================
// CEE Medico Nepal — Shared Header & Footer
// =============================================

export function renderHeader(activePage = '') {
    const navLinks = [
        { href: 'index.html', label: 'Home' },
        { href: 'exam.html', label: 'Take Exam' },
        { href: 'daily-test.html', label: 'Daily Test' },
        { href: 'leaderboard.html', label: 'Leaderboard' },
        { href: 'analytics.html', label: 'Analytics' },
    ];

    const navHTML = navLinks.map(link => `
        <a href="${link.href}" class="text-sm font-semibold ${activePage === link.label ? 'text-medical-500 border-b-2 border-medical-500 pb-0.5' : 'text-slate-600 hover:text-medical-500'} transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-medical-500 hover:after:w-full after:transition-all">${link.label}</a>
    `).join('');

    const mobileNavHTML = navLinks.map(link => `
        <a href="${link.href}" class="block text-base font-bold ${activePage === link.label ? 'text-medical-500 bg-medical-50' : 'text-slate-700 hover:text-medical-500 hover:bg-slate-50'} px-3 py-2 rounded-lg transition-colors">${link.label}</a>
    `).join('');

    return `
    <!-- Floating WhatsApp Button -->
    <button id="chatFab" aria-label="Chat on WhatsApp" class="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center text-3xl shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgb(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 z-50 cursor-pointer group">
        <i class="fab fa-whatsapp group-hover:rotate-12 transition-transform"></i>
        <span class="absolute right-16 bg-[#128C7E] text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">Get Instant Support!</span>
    </button>

    <!-- Sticky Header -->
    <header class="sticky top-0 w-full bg-white/90 backdrop-blur-md z-40 transition-all duration-300 border-b border-medical-100" id="mainHeader">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">

                <!-- Logo -->
                <a href="index.html" class="flex items-center gap-3 group">
                    <div class="relative w-11 h-11 bg-medical-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-medical-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                        <img src="Logo.png" alt="Logo" class="w-full h-full object-cover" onerror="this.style.display='none'; document.getElementById('logoFallback').style.display='flex'">
                        <div id="logoFallback" class="hidden absolute inset-0 items-center justify-center bg-gradient-to-tr from-medical-600 to-medical-500 font-extrabold text-white text-lg">CM</div>
                    </div>
                    <div>
                        <h1 class="text-lg sm:text-xl font-extrabold text-medical-950 tracking-tight group-hover:text-medical-500 transition-colors">CEE Medico <span class="text-medical-500">Nepal</span></h1>
                        <p class="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">MCQ EXAM PLATFORM</p>
                    </div>
                </a>

                <!-- Desktop Navigation -->
                <nav class="hidden md:flex items-center gap-6">
                    ${navHTML}
                    <!-- Subject Dropdown -->
                    <div class="relative group">
                        <button class="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-medical-500 transition-colors">
                            Subjects <i class="fa-solid fa-chevron-down text-[10px] group-hover:rotate-180 transition-transform duration-200"></i>
                        </button>
                        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-50">
                            <a href="exam.html?subject=physics" class="block px-4 py-2 text-sm text-slate-700 hover:bg-medical-50 hover:text-medical-500 transition-colors font-medium">Physics</a>
                            <a href="exam.html?subject=chemistry" class="block px-4 py-2 text-sm text-slate-700 hover:bg-medical-50 hover:text-medical-500 transition-colors font-medium">Chemistry</a>
                            <a href="exam.html?subject=botany" class="block px-4 py-2 text-sm text-slate-700 hover:bg-medical-50 hover:text-medical-500 transition-colors font-medium">Botany</a>
                            <a href="exam.html?subject=zoology" class="block px-4 py-2 text-sm text-slate-700 hover:bg-medical-50 hover:text-medical-500 transition-colors font-medium">Zoology</a>
                        </div>
                    </div>
                    <a href="admin/upload.html" class="shimmer-btn inline-flex items-center justify-center bg-medical-500 hover:bg-medical-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-medical-500/10 hover:shadow-medical-500/20 active:scale-95 transition-all">
                        <i class="fa-solid fa-shield-halved mr-2"></i> Admin
                    </a>
                </nav>

                <!-- Mobile Menu Button -->
                <button id="mobileMenuBtn" aria-label="Toggle menu" class="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-medical-500 transition-colors">
                    <i class="fas fa-bars text-2xl" id="menuIcon"></i>
                </button>
            </div>
        </div>

        <!-- Mobile Drawer -->
        <div id="mobileDrawer" class="hidden md:hidden fixed inset-x-0 top-20 bg-white border-b border-slate-100 shadow-xl py-6 px-4 space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto z-40">
            ${mobileNavHTML}
            <div class="px-3 pt-2">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Subjects</p>
                <div class="grid grid-cols-2 gap-2">
                    <a href="exam.html?subject=physics" class="block bg-slate-50 hover:bg-medical-50 text-slate-700 hover:text-medical-500 p-2.5 rounded-lg font-semibold text-sm">Physics</a>
                    <a href="exam.html?subject=chemistry" class="block bg-slate-50 hover:bg-medical-50 text-slate-700 hover:text-medical-500 p-2.5 rounded-lg font-semibold text-sm">Chemistry</a>
                    <a href="exam.html?subject=botany" class="block bg-slate-50 hover:bg-medical-50 text-slate-700 hover:text-medical-500 p-2.5 rounded-lg font-semibold text-sm">Botany</a>
                    <a href="exam.html?subject=zoology" class="block bg-slate-50 hover:bg-medical-50 text-slate-700 hover:text-medical-500 p-2.5 rounded-lg font-semibold text-sm">Zoology</a>
                </div>
            </div>
            <a href="admin/upload.html" class="block text-center bg-medical-500 hover:bg-medical-600 text-white font-bold py-3 rounded-xl shadow-lg transition-colors mt-4">
                <i class="fa-solid fa-shield-halved mr-2"></i> Admin Panel
            </a>
        </div>
    </header>`;
}

export function renderFooter() {
    return `
    <footer class="bg-[#0c1524] text-slate-400 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10">

                <!-- Brand Column -->
                <div class="space-y-4">
                    <a href="index.html" class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-medical-500 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow-lg">CM</div>
                        <div>
                            <p class="font-extrabold text-white text-base leading-tight">CEE Medico Nepal</p>
                            <p class="text-[10px] text-slate-500 uppercase tracking-widest">MCQ PLATFORM</p>
                        </div>
                    </a>
                    <p class="text-xs leading-relaxed text-slate-500">Nepal's comprehensive CEE entrance preparation platform with 50,000+ curated MCQs, live mock tests, and AI-powered analytics.</p>
                    <div class="flex gap-2 pt-2">
                        <a href="https://www.facebook.com/techgy.shyamsundar" class="w-9 h-9 bg-slate-800 hover:bg-medical-500 hover:text-white rounded-lg flex items-center justify-center text-sm transition-all"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/shyamsundar98122/" class="w-9 h-9 bg-slate-800 hover:bg-pink-500 hover:text-white rounded-lg flex items-center justify-center text-sm transition-all"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.youtube.com/@ceemediconepal" class="w-9 h-9 bg-slate-800 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center text-sm transition-all"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>

                <!-- Exam Links -->
                <div class="space-y-4">
                    <h3 class="text-sm font-extrabold text-white uppercase tracking-widest">Exam System</h3>
                    <ul class="space-y-2.5 text-sm font-medium">
                        <li><a href="exam.html" class="hover:text-medical-400 transition-colors">Chapter Exam</a></li>
                        <li><a href="daily-test.html" class="hover:text-medical-400 transition-colors">Daily Mock Test</a></li>
                        <li><a href="leaderboard.html" class="hover:text-medical-400 transition-colors">Leaderboard</a></li>
                        <li><a href="analytics.html" class="hover:text-medical-400 transition-colors">My Analytics</a></li>
                        <li><a href="result.html" class="hover:text-medical-400 transition-colors">Exam Results</a></li>
                    </ul>
                </div>

                <!-- Subjects -->
                <div class="space-y-4">
                    <h3 class="text-sm font-extrabold text-white uppercase tracking-widest">Subjects</h3>
                    <ul class="space-y-2.5 text-sm font-medium">
                        <li><a href="exam.html?subject=physics" class="hover:text-medical-400 transition-colors">Physics</a></li>
                        <li><a href="exam.html?subject=chemistry" class="hover:text-medical-400 transition-colors">Chemistry</a></li>
                        <li><a href="exam.html?subject=botany" class="hover:text-medical-400 transition-colors">Botany</a></li>
                        <li><a href="exam.html?subject=zoology" class="hover:text-medical-400 transition-colors">Zoology</a></li>
                        <li><a href="admin/upload.html" class="hover:text-medical-400 transition-colors">Admin Upload</a></li>
                    </ul>
                </div>

                <!-- Contact -->
                <div class="space-y-4">
                    <h3 class="text-sm font-extrabold text-white uppercase tracking-widest">Contact</h3>
                    <ul class="space-y-3 text-sm">
                        <li class="flex items-start gap-2.5"><i class="fas fa-map-marker-alt text-medical-500 mt-1"></i><span>Kathmandu, Nepal</span></li>
                        <li class="flex items-start gap-2.5"><i class="fas fa-phone text-medical-500 mt-1"></i><span>+977 9812240229</span></li>
                        <li class="flex items-start gap-2.5"><i class="fas fa-envelope text-medical-500 mt-1"></i><a href="mailto:avik96045@gmail.com" class="hover:text-white transition-colors">avik96045@gmail.com</a></li>
                    </ul>
                </div>
            </div>

            <div class="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p>© 2026 CEE Medico Nepal. All Rights Reserved.</p>
                <div class="flex gap-4">
                    <a href="#" class="hover:text-slate-300">Privacy Policy</a>
                    <span class="text-slate-700">|</span>
                    <a href="#" class="hover:text-slate-300">Terms of Use</a>
                </div>
            </div>
        </div>
    </footer>`;
}

export function initSharedScripts() {
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const menuIcon = document.getElementById('menuIcon');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileDrawer.classList.toggle('hidden');
            menuIcon.className = isHidden ? "fas fa-bars text-2xl" : "fas fa-times text-2xl";
        });
        document.querySelectorAll('#mobileDrawer a').forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.add('hidden');
                menuIcon.className = "fas fa-bars text-2xl";
            });
        });
    }

    // Glassmorphic scroll header
    const mainHeader = document.getElementById('mainHeader');
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            mainHeader.classList.toggle('scrolled-header', window.scrollY > 20);
        });
    }

    // WhatsApp FAB
    const chatFab = document.getElementById('chatFab');
    if (chatFab) {
        chatFab.addEventListener('click', () => window.open('https://wa.me/9779812240229', '_blank'));
    }

    // Scroll reveal
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}
