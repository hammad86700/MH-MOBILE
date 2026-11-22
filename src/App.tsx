import React, { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Menu, Moon, Sun, X } from 'lucide-react';
import {
  DEFAULT_ACCESSORIES,
  DEFAULT_FAQS,
  DEFAULT_KNOWLEDGE_ENTRIES,
  DEFAULT_REPAIR_SERVICES,
  DEFAULT_SHOP_SETTINGS,
  DEFAULT_TESTIMONIALS,
  formatWhatsAppUrl,
} from './data/defaults';
import {
  auth,
  checkIsUserAdmin,
  fetchStorefrontSnapshot,
} from './lib/firebase';
import type {
  Accessory,
  FaqItem,
  KnowledgeEntry,
  PublicPage,
  RepairService,
  ShopSettings,
  Testimonial,
} from './types';
import { AdminDashboard } from './components/AdminDashboard';
import { AiSupportChatbot } from './components/AiSupportChatbot';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InquiryModal, RepairBookingModal } from './components/Modals';
import {
  AboutPage,
  AccessoriesPage,
  ContactPage,
  HomePage,
  RepairsPage,
} from './components/PublicPages';

const PAGE_TITLES: Record<PublicPage, string> = {
  home: 'HM Mobile – Mobile Repairing & Accessories | Rahim Yar Khan',
  repairs: 'Mobile Repairing Services – HM Mobile | Rahim Yar Khan',
  accessories: 'Mobile Accessories Catalog – HM Mobile | Rahim Yar Khan',
  about: 'About Us – HM Mobile | Main Auto Market, Rahim Yar Khan',
  contact: 'Contact & Location – HM Mobile | Rahim Yar Khan',
  admin: 'Admin Dashboard – HM Mobile',
};

export default function App() {
  const [page, setPage] = useState<PublicPage>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  // Storefront data hydrated from Firestore (with non-fabricated defaults before initial seed)
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [services, setServices] = useState<RepairService[]>(DEFAULT_REPAIR_SERVICES);
  const [accessories, setAccessories] = useState<Accessory[]>(DEFAULT_ACCESSORIES);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>(
    DEFAULT_KNOWLEDGE_ENTRIES
  );
  const [isSeededInDb, setIsSeededInDb] = useState(false);

  // Auth state for Admin Dashboard
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Global modals & chatbot triggers
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);
  const [inquiryModalState, setInquiryModalState] = useState<{
    open: boolean;
    itemName: string;
    type: 'accessory' | 'service' | 'general';
  }>({ open: false, itemName: '', type: 'general' });
  const [chatOpenTrigger, setChatOpenTrigger] = useState(0);

  // Sync Tailwind v4 dark class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Dynamic SEO document title per view
  useEffect(() => {
    document.title = PAGE_TITLES[page];
  }, [page]);

  // Listen for Google Maps Platform Demo Key quota events
  useEffect(() => {
    const handler = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  const loadStorefront = useCallback(async () => {
    try {
      const snap = await fetchStorefrontSnapshot();
      setSettings(snap.settings);
      setServices(snap.services);
      setAccessories(snap.accessories);
      setFaqs(snap.faqs);
      setTestimonials(snap.testimonials);
      setKnowledgeEntries(snap.knowledgeEntries);
      setIsSeededInDb(snap.isSeededInDb);
    } catch (err) {
      console.error('Storefront load fallback to defaults:', err);
    }
  }, []);

  useEffect(() => {
    void loadStorefront();
  }, [loadStorefront]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminOk = await checkIsUserAdmin(currentUser);
        setIsAdmin(adminOk);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  function navigateTo(next: PublicPage) {
    setPage(next);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenBooking(serviceName?: string) {
    setPreselectedService(serviceName);
    setBookingModalOpen(true);
  }

  function handleOpenInquiry(itemName: string, type: 'accessory' | 'service' | 'general') {
    setInquiryModalState({ open: true, itemName, type });
  }

  const navLinks: Array<{ id: PublicPage; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'repairs', label: 'Repairs' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const footerWaHref = formatWhatsAppUrl(
    settings.whatsappNumber,
    `Assalam-o-Alaikum ${settings.businessName}, I would like to connect.`
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100">
        {mapsQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Strict 3-Zone Top Bar Contract */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
            {/* Zone 1: Single text wordmark */}
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="text-lg font-extrabold font-display tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
            >
              {settings.businessName}
            </button>

            {/* Zone 2: 5 concise single-line text nav links */}
            <nav
              aria-label="Primary Navigation"
              className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => navigateTo(link.id)}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    page === link.id
                      ? 'border-blue-700 dark:border-blue-500 text-slate-900 dark:text-white'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Zone 3: 1 primary action (plus mobile menu button on small viewports) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenBooking()}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Book Repair
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                className="md:hidden p-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1420] px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => navigateTo(link.id)}
                  className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                    page === link.id
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setDarkMode((d) => !d)}
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('admin')}
                  className="text-xs font-medium text-blue-700 dark:text-blue-400"
                >
                  Admin Portal
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {page === 'home' && (
            <HomePage
              settings={settings}
              services={services}
              accessories={accessories}
              faqs={faqs}
              testimonials={testimonials}
              onNavigate={navigateTo}
              onBookRepair={handleOpenBooking}
              onInquire={handleOpenInquiry}
              onOpenChat={() => setChatOpenTrigger((n) => n + 1)}
            />
          )}
          {page === 'repairs' && (
            <RepairsPage
              settings={settings}
              services={services}
              onBookRepair={handleOpenBooking}
              onInquire={handleOpenInquiry}
            />
          )}
          {page === 'accessories' && (
            <AccessoriesPage
              settings={settings}
              accessories={accessories}
              onInquire={handleOpenInquiry}
            />
          )}
          {page === 'about' && (
            <AboutPage
              settings={settings}
              onBookRepair={handleOpenBooking}
              onNavigate={navigateTo}
            />
          )}
          {page === 'contact' && <ContactPage settings={settings} />}
          {page === 'admin' && (
            <AdminDashboard
              user={user}
              authLoading={authLoading}
              isAdmin={isAdmin}
              isSeededInDb={isSeededInDb}
              settings={settings}
              services={services}
              accessories={accessories}
              faqs={faqs}
              testimonials={testimonials}
              knowledgeEntries={knowledgeEntries}
              onRefreshPublic={loadStorefront}
            />
          )}
        </main>

        {/* Quiet Commercial Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1420]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-200 dark:border-slate-800">
              <div className="md:col-span-5 space-y-2">
                <p className="text-base font-bold font-display text-slate-900 dark:text-white">
                  {settings.businessName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                  {settings.locationAddress}. Mobile repairing, hardware diagnostics, software troubleshooting, and accessories.
                </p>
              </div>
              <div className="md:col-span-4 space-y-2">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Navigation
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => navigateTo(link.id)}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-3 space-y-2">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Quick Actions
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  {footerWaHref && (
                    <a
                      href={footerWaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
                    >
                      WhatsApp
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setDarkMode((d) => !d)}
                    className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    {darkMode ? 'Light Theme' : 'Dark Theme'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('admin')}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 font-medium"
                  >
                    Admin Portal
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <p>
                © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
              </p>
              <p>Rahim Yar Khan, Pakistan · Service availability & pricing confirmed by shop.</p>
            </div>
          </div>
        </footer>

        {/* Global Floating Gemini AI Support Chatbot */}
        {page !== 'admin' && (
          <AiSupportChatbot
            settings={settings}
            services={services}
            accessories={accessories}
            faqs={faqs}
            knowledgeEntries={knowledgeEntries}
            onOpenBookingModal={handleOpenBooking}
            externalOpenTrigger={chatOpenTrigger}
          />
        )}

        {/* Global Modals */}
        <RepairBookingModal
          open={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          services={services}
          settings={settings}
          preselectedService={preselectedService}
        />

        <InquiryModal
          open={inquiryModalState.open}
          onClose={() => setInquiryModalState((p) => ({ ...p, open: false }))}
          itemName={inquiryModalState.itemName}
          inquiryType={inquiryModalState.type}
          settings={settings}
        />
      </div>
    </ErrorBoundary>
  );
}
