import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import {
  ACCESSORY_CATEGORIES,
  STUDIO_IMAGES,
  formatWhatsAppUrl,
} from '../data/defaults';
import { submitCustomerInquiry } from '../lib/firebase';
import type {
  Accessory,
  AvailabilityStatus,
  FaqItem,
  PublicPage,
  RepairService,
  ServiceCategory,
  ShopSettings,
  Testimonial,
} from '../types';
import { ResilientImage, ServiceIcon } from './ServiceIcon';
import { ShopMap } from './ShopMap';

function formatAvailabilityLabel(status: AvailabilityStatus): {
  label: string;
  toneClass: string;
} {
  switch (status) {
    case 'in_stock':
      return {
        label: 'In Stock',
        toneClass: 'text-emerald-700 dark:text-emerald-400',
      };
    case 'limited_stock':
      return {
        label: 'Limited Stock',
        toneClass: 'text-amber-700 dark:text-amber-400',
      };
    case 'out_of_stock':
      return {
        label: 'Currently Out of Stock',
        toneClass: 'text-red-700 dark:text-red-400',
      };
    default:
      return {
        label: 'Confirm Availability',
        toneClass: 'text-slate-600 dark:text-slate-400',
      };
  }
}

function formatServiceCategory(cat: ServiceCategory): string {
  if (cat === 'hardware') return 'Hardware';
  if (cat === 'software') return 'Software';
  return 'Diagnostics';
}

interface SharedProps {
  settings: ShopSettings;
  services: RepairService[];
  accessories: Accessory[];
  faqs: FaqItem[];
  testimonials: Testimonial[];
  onNavigate: (page: PublicPage) => void;
  onBookRepair: (serviceName?: string) => void;
  onInquire: (itemName: string, type: 'accessory' | 'service' | 'general') => void;
  onOpenChat: () => void;
}

export function HomePage({
  settings,
  services,
  accessories,
  faqs,
  testimonials,
  onNavigate,
  onBookRepair,
  onInquire,
  onOpenChat,
}: SharedProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id ?? null);

  const featuredServices = useMemo(() => {
    const picked = services.filter((s) => s.isFeatured);
    return (picked.length >= 6 ? picked : services).slice(0, 6);
  }, [services]);

  const featuredAccessories = useMemo(() => {
    const picked = accessories.filter((a) => a.isFeatured);
    return (picked.length >= 6 ? picked : accessories).slice(0, 6);
  }, [accessories]);

  const publishedFaqs = useMemo(
    () => faqs.filter((f) => f.isPublished).slice(0, 6),
    [faqs]
  );

  const publishedTestimonials = useMemo(
    () => testimonials.filter((t) => t.isPublished).slice(0, 3),
    [testimonials]
  );

  const waShopHref = formatWhatsAppUrl(
    settings.whatsappNumber,
    `Assalam-o-Alaikum ${settings.businessName}, I found your website and would like to inquire about mobile repairing or accessories.`
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1420]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>{settings.businessName}</span>
                <span aria-hidden="true">·</span>
                <span>Main Auto Market, Rahim Yar Khan</span>
              </div>

              <h1 className="text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.08] text-slate-900 dark:text-white text-balance">
                Precision mobile repairing and curated accessories you can trust.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {settings.tagline}. Honest hardware diagnostics, legitimate software care,
                and 24/7 AI support in English, Urdu, and Roman Urdu.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onBookRepair()}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Wrench className="w-4 h-4" />
                  Book a Repair
                </button>
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask AI Support
                </button>
                {waShopHref ? (
                  <a
                    href={waShopHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-emerald-800 dark:text-emerald-300 hover:underline whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Shop
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('contact')}
                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    Visit Shop
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <ResilientImage
                  src={STUDIO_IMAGES.heroStudio}
                  alt="HM Mobile precision smartphone repair workbench"
                  fallbackTitle="HM Mobile Repair Studio"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Grounded Capability Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                16+ Repair Categories
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Displays, batteries, charging ports, board inspection, and legitimate software care.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                12 Accessory Categories
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Chargers, cables, audio, power banks, cases, tempered glass, and smart watches.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Inspection-First Clarity
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Availability, charges, and repair times are confirmed transparently with you first.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                English, Urdu & Roman Urdu AI
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Instant safe troubleshooting and repair ticket logging any time of day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Repair Services Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              Mobile Repairing Services
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
              Hardware diagnostics and careful component repair
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('repairs')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
          >
            View all {services.length} services
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service, index) => (
            <article
              key={service.id}
              className="flex flex-col justify-between p-6 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 transition-transform duration-150 hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ServiceIcon iconKey={service.iconKey} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono-tabular text-slate-400 dark:text-slate-500">
                    0{index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatServiceCategory(service.category)}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {service.isConfirmedAvailable
                      ? 'Confirmed Available'
                      : 'Confirm Availability'}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {service.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                  {service.priceLabel || 'Contact for Confirmation'}
                </span>
                <button
                  type="button"
                  onClick={() => onBookRepair(service.name)}
                  className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
                >
                  Request Service
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Featured Mobile Accessories */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1420]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                Mobile Accessories Catalog
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                Everyday essentials for protection, power, and audio
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('accessories')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
            >
              Browse all {accessories.length} categories
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAccessories.map((item) => {
              const stock = formatAvailabilityLabel(item.availabilityStatus);
              return (
                <article
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <ResilientImage
                      src={item.imageUrl}
                      alt={item.name}
                      fallbackTitle={item.category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="truncate">{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`whitespace-nowrap shrink-0 font-medium ${stock.toneClass}`}>
                          {stock.label}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium font-mono-tabular text-slate-900 dark:text-slate-100">
                        {item.priceLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => onInquire(item.name, 'accessory')}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        Inquire
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us & Repair Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-5">
            <div className="h-full min-h-[260px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
              <ResilientImage
                src={STUDIO_IMAGES.displayRepair}
                alt="Precision mobile display and component repair tools"
                fallbackTitle="HM Mobile Inspection Standards"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                Why Choose {settings.businessName}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                Straightforward diagnostics with zero guesswork
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {settings.whyChooseUsNote}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  01. Inspection Before Commitment
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  We examine your device and discuss part availability and expected charges before starting any repair.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  02. Hardware & Software Under One Roof
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  From screen and battery replacements to firmware updates and data transfer guidance.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  03. Multilingual Digital Support
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Get safe troubleshooting tips and log repair tickets in English, Urdu, or Roman Urdu anytime.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  04. Central Rahim Yar Khan Location
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Easy to reach at {settings.locationAddress}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials (Transparent Editable Placeholders) */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1420]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-2 max-w-2xl mb-10">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              Customer Feedback
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Customer reviews
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Verified reviews are managed by the shop owner. Any placeholder cards below are clearly marked until real customer reviews are published.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publishedTestimonials.map((review) => (
              <blockquote
                key={review.id}
                className="p-6 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4"
              >
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  “{review.quote}”
                </p>
                <footer className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {review.customerName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {review.deviceOrService}
                    {review.isPlaceholder ? ' · Editable Placeholder' : ''}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="space-y-2 mb-10">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
            Frequently Asked Questions
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Common questions about repairs and inquiries
          </h2>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
          {publishedFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between gap-4 text-left py-1"
                  aria-expanded={isOpen}
                >
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      {faq.category}
                    </span>
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-150 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-8">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact & Location CTA Band */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1420]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Need help with your smartphone today?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Visit {settings.businessName} at {settings.locationAddress}, send a repair request online, or chat with our AI support assistant.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {waShopHref ? (
                <a
                  href={waShopHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact on WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact HM Mobile
                </button>
              )}
              <button
                type="button"
                onClick={() => onBookRepair()}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Book Repair Request
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function RepairsPage({
  settings,
  services,
  onBookRepair,
  onInquire,
}: Pick<SharedProps, 'settings' | 'services' | 'onBookRepair' | 'onInquire'>) {
  const [categoryFilter, setCategoryFilter] = useState<'all' | ServiceCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return services.filter((svc) => {
      if (categoryFilter !== 'all' && svc.category !== categoryFilter) return false;
      if (
        q &&
        !svc.name.toLowerCase().includes(q) &&
        !svc.description.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [services, categoryFilter, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-3 max-w-3xl">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
          Mobile Repairing Services
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
          Hardware, software, and diagnostic repair services
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Select a service below to submit a repair request or inquire directly. Final repair availability, parts, and pricing are confirmed by {settings.businessName} after inspecting your model.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg self-start overflow-x-auto max-w-full">
          {(
            [
              { key: 'all', label: 'All Services' },
              { key: 'hardware', label: 'Hardware' },
              { key: 'software', label: 'Software' },
              { key: 'diagnostics', label: 'Diagnostics' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategoryFilter(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === tab.key
                  ? 'bg-white dark:bg-[#131A26] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repair services..."
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131A26] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131A26]">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No repair services match your filter. Try clearing the search or submit a custom request.
          </p>
          <button
            type="button"
            onClick={() => onBookRepair('Other Mobile Hardware & Software Services')}
            className="mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
          >
            Submit Custom Repair Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((svc) => {
            const waHref = formatWhatsAppUrl(
              settings.whatsappNumber,
              `Assalam-o-Alaikum ${settings.businessName}, please confirm availability and estimate for: ${svc.name}.`
            );
            return (
              <article
                key={svc.id}
                className="flex flex-col justify-between p-6 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                    <ServiceIcon iconKey={svc.iconKey} className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatServiceCategory(svc.category)}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        svc.isConfirmedAvailable
                          ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      {svc.isConfirmedAvailable
                        ? 'Confirmed Available'
                        : 'Availability Confirmed at Shop'}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {svc.name}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Estimate: <span className="text-slate-900 dark:text-slate-100">{svc.priceLabel || 'Contact for Confirmation'}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onBookRepair(svc.name)}
                      className="flex-1 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Request Service
                    </button>
                    {waHref ? (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onInquire(svc.name, 'service')}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        Inquire
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AccessoriesPage({
  settings,
  accessories,
  onInquire,
}: Pick<SharedProps, 'settings' | 'accessories' | 'onInquire'>) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return accessories.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (
        q &&
        !item.name.toLowerCase().includes(q) &&
        !item.category.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [accessories, selectedCategory, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-3 max-w-3xl">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
          Mobile Accessories Catalog
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
          Chargers, audio, protection, and everyday mobile gear
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Browse our 12 accessory categories below. Prices and live stock for specific phone models are maintained in our Admin catalog—send a quick inquiry or WhatsApp message to confirm availability.
        </p>
      </div>

      {/* Category Filter + Search */}
      <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            Showing {filtered.length} of {accessories.length} catalog listings
          </p>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search accessories..."
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131A26] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', ...ACCESSORY_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600'
                  : 'bg-white dark:bg-[#131A26] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131A26]">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No accessories found matching your filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const stock = formatAvailabilityLabel(item.availabilityStatus);
            const waHref = formatWhatsAppUrl(
              settings.whatsappNumber,
              `Assalam-o-Alaikum ${settings.businessName}, I want to check availability and order: ${item.name} (${item.category}).`
            );

            return (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <ResilientImage
                    src={item.imageUrl}
                    alt={item.name}
                    fallbackTitle={item.category}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="truncate">{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-medium whitespace-nowrap shrink-0 ${stock.toneClass}`}>
                        {stock.label}
                      </span>
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <p className="text-sm font-semibold font-mono-tabular text-slate-900 dark:text-slate-100">
                      {item.priceLabel}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onInquire(item.name, 'accessory')}
                        className="flex-1 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Inquire Now
                      </button>
                      {waHref ? (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp Order
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onInquire(`${item.name} (WhatsApp Order Request)`, 'accessory')}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          Confirm Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AboutPage({
  settings,
  onBookRepair,
  onNavigate,
}: Pick<SharedProps, 'settings' | 'onBookRepair' | 'onNavigate'>) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
            About {settings.businessName}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            Serving Rahim Yar Khan with practical, transparent smartphone care
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {settings.aboutIntro}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => onBookRepair()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors"
            >
              Book a Repair
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Visit Our Shop
            </button>
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="h-full min-h-[280px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
            <ResilientImage
              src={STUDIO_IMAGES.heroStudio}
              alt="HM Mobile service workspace"
              fallbackTitle="HM Mobile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <section className="p-6 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-2.5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            01. Our Services
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settings.aboutServicesSummary}
          </p>
        </section>

        <section className="p-6 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-2.5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            02. Our Mission
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settings.missionStatement}
          </p>
        </section>

        <section className="p-6 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-2.5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            03. Customer Satisfaction
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settings.customerSatisfactionNote}
          </p>
        </section>

        <section className="p-6 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-2.5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            04. Why Customers Choose Us
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {settings.whyChooseUsNote}
          </p>
        </section>
      </div>
    </div>
  );
}

export function ContactPage({ settings }: Pick<SharedProps, 'settings'>) {
  const [customerName, setCustomerName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const waHref = formatWhatsAppUrl(
    settings.whatsappNumber,
    `Assalam-o-Alaikum ${settings.businessName}, I have an inquiry from your website.`
  );

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (customerName.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (contactInfo.trim().length < 4) {
      setError('Please provide your phone number, WhatsApp, or email.');
      return;
    }
    if (message.trim().length < 5) {
      setError('Please write a brief message.');
      return;
    }

    setSubmitting(true);
    try {
      await submitCustomerInquiry({
        inquiryType: 'general',
        customerName,
        contactInfo,
        message,
      });
      setSubmitted(true);
      setCustomerName('');
      setContactInfo('');
      setMessage('');
    } catch {
      setError('Could not submit your message right now. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  const socialLinks = [
    { label: 'Facebook', url: settings.facebookUrl },
    { label: 'Instagram', url: settings.instagramUrl },
    { label: 'TikTok', url: settings.tiktokUrl },
  ].filter((item) => /^https?:\/\//i.test(item.url.trim()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      <div className="space-y-3 max-w-3xl">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
          Contact & Location
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
          Visit {settings.businessName} in Rahim Yar Khan
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Reach out for repair confirmation, accessory availability, or technical inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Details + Map */}
        <div className="lg:col-span-7 space-y-6">
          <ShopMap
            businessName={settings.businessName}
            locationAddress={settings.locationAddress}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Shop Address</span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {settings.locationAddress}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Business Hours</span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {settings.openingHours || 'To be confirmed — contact shop'}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Phone className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Phone Number</span>
              </div>
              <p className="text-sm font-medium font-mono-tabular text-slate-900 dark:text-slate-100">
                {settings.phoneNumber.trim() || 'Contact number to be added in Admin'}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <MessageCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>WhatsApp Contact</span>
              </div>
              {waHref ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline font-mono-tabular"
                >
                  {settings.whatsappNumber}
                </a>
              ) : (
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  WhatsApp number to be added in Admin
                </p>
              )}
            </div>
          </div>

          {(settings.email.trim() || socialLinks.length > 0) && (
            <div className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              {settings.email.trim() && (
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>{settings.email}</span>
                </div>
              )}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Contact Form */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-7 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Send a message to {settings.businessName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your inquiry is stored securely for our shop staff to review and reply.
              </p>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Message Received
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Thank you for contacting {settings.businessName}. Our team will follow up with you directly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone, WhatsApp, or Email *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    How can we help? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={1500}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your mobile model, repair question, or accessory inquiry..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 rounded-lg transition-colors"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Inquiry
                </button>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  Your contact details are visible only to authorized HM Mobile staff.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
