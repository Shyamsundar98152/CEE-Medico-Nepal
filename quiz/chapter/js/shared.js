// =============================================
// CEE Medico Nepal — Shared Header & Footer Components
// =============================================

export function renderHeader(activePage = '') {
    const navLinks = [
        { href: 'index.html', label: 'Home' },
        { href: 'exam.html', label: 'Take Exam' },
        { href: 'daily-test.html', label: 'Daily Test' },
        { href: 'leaderboard.html', label: 'Leaderboard' },
        { href: 'analytics.html', label: 'Analytics' },
        { href: 'upload.html', label: 'Admin Portal' }
    ];

    const navHTML = navLinks.map(link => `
        <a href="${link.href}" class="text-sm font-semibold ${activePage === link.label ? 'text-medical-500 border-b-2 border-medical-500 pb-1' : 'text-slate-600 hover:text-medical-500'} transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-medical-500 hover:after:w-full after:transition-all">${link.label}</a>
    `).join('');

    const mobileNavHTML = navLinks.map(link => `
        <a href="${link.href}" class="block text-base font-bold ${activePage === link.label ? 'text-medical-500 bg-medical-50' : 'text-slate-700 hover:text-medical-500 hover:bg-slate-50'} px-3 py-2 rounded-lg transition-colors">${link.label}</a>
    `).join('');

    return `
    <header id="mainHeader" class="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md transition-all duration-300">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <a href="index.html" class="flex items-center gap-2.5 group">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-medical-500 to-medical-600 text-white shadow-md shadow-medical-500/20 group-hover:rotate-6 transition-transform">
                    <i class="fa-solid fa-notes-medical text-lg"></i>
                </div>
                <div class="flex flex-col">
                    <span class="text-base font-black tracking-tight text-slate-900 leading-none">CEE Medico</span>
                    <span class="text-[10px] font-bold text-medical-500 tracking-wider uppercase mt-0.5">Nepal Prep</span>
                </div>
            </a>
            
            <nav class="hidden md:flex items-center gap-6">
                ${navHTML}
            </nav>

            <div class="flex items-center gap-3">
                <button id="mobileMenuBtn" class="md:hidden flex items-center justify-center h-10 w-10 rounded-xl hover:bg-slate-50 transition-all text-slate-700">
                    <i id="menuIcon" class="fas fa-bars text-xl"></i>
                </button>
            </div>
        </div>
        
        <!-- Mobile Navigation Drawer -->
        <div id="mobileDrawer" class="hidden md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 shadow-lg">
            ${mobileNavHTML}
        </div>
    </header>
    `;
}

export function renderFooter() {
    return `
    <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="h-8 w-8 rounded-lg bg-medical-500 text-white flex items-center justify-center"><i class="fa-solid fa-notes-medical text-sm"></i></div>
                        <span class="text-white font-extrabold text-lg">CEE Medico Nepal</span>
                    </div>
                    <p class="text-sm leading-relaxed">Your ultimate test preparation suite for the Common Entrance Examination (CEE) Nepal. Perfect practice breeds unmatched performance.</p>
                </div>
                <div>
                    <h4 class="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Navigation</h4>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <a href="index.html" class="hover:text-white transition-colors">Home</a>
                        <a href="exam.html" class="hover:text-white transition-colors">Take Exam</a>
                        <a href="daily-test.html" class="hover:text-white transition-colors">Daily Mock Test</a>
                        <a href="leaderboard.html" class="hover:text-white transition-colors">Leaderboard</a>
                        <a href="analytics.html" class="hover:text-white transition-colors">My Analytics</a>
                        <a href="upload.html" class="hover:text-white transition-colors">Admin Upload</a>
                    </div>
                </div>
                <div>
                    <h4 class="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact & Assistance</h4>
                    <p class="text-sm leading-relaxed mb-3">Encountering structural bugs or data sync problems? Get in touch via WhatsApp:</p>
                    <a href="https://wa.me/9779812240229" target="_blank" class="inline-flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"><i class="fa-brands fa-whatsapp text-base"></i> WhatsApp Support</a>
                </div>
            </div>
            <div class="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <p>&copy; ${new Date().getFullYear()} CEE Medico Nepal. All Rights Reserved.</p>
                <div class="flex gap-4">
                    <span class="hover:text-white cursor-pointer">Privacy Policy</span>
                    <span class="hover:text-white cursor-pointer">Terms of Service</span>
                </div>
            </div>
        </div>
    </footer>
    `;
}

export function initSharedScripts() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const menuIcon = document.getElementById('menuIcon');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileDrawer.classList.toggle('hidden');
            menuIcon.className = isHidden ? "fas fa-bars text-xl" : "fas fa-times text-xl";
        });
        document.querySelectorAll('#mobileDrawer a').forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.add('hidden');
                menuIcon.className = "fas fa-bars text-xl";
            });
        });
    }

    const mainHeader = document.getElementById('mainHeader');
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            mainHeader.classList.toggle('shadow-md', window.scrollY > 20);
        });
    }
}
