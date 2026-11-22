import React, { useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  BookOpen,
  ClipboardList,
  Database,
  HelpCircle,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Package,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShieldAlert,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  ACCESSORY_CATEGORIES,
  STUDIO_IMAGES,
  createSafeDocId,
} from '../data/defaults';
import {
  deleteAccessory,
  deleteChatLog,
  deleteFaq,
  deleteInquiry,
  deleteKnowledgeEntry,
  deleteRepairRequest,
  deleteRepairService,
  deleteTestimonial,
  fetchAdminPrivateCollections,
  saveAccessory,
  saveFaq,
  saveKnowledgeEntry,
  saveRepairService,
  saveShopSettings,
  saveTestimonial,
  seedInitialStorefrontData,
  signInAdminWithGoogle,
  signOutAdmin,
  updateInquiryStatus,
  updateRepairRequestStatus,
} from '../lib/firebase';
import type {
  Accessory,
  AccessoryCategory,
  AvailabilityStatus,
  ChatLog,
  CustomerInquiry,
  FaqItem,
  InquiryStatus,
  KnowledgeCategory,
  KnowledgeEntry,
  RepairRequest,
  RepairRequestStatus,
  RepairService,
  ServiceCategory,
  ShopSettings,
  Testimonial,
} from '../types';

type AdminTab =
  | 'overview'
  | 'requests'
  | 'inquiries'
  | 'services'
  | 'accessories'
  | 'content'
  | 'ai_kb'
  | 'settings';

interface AdminDashboardProps {
  user: User | null;
  authLoading: boolean;
  isAdmin: boolean;
  isSeededInDb: boolean;
  settings: ShopSettings;
  services: RepairService[];
  accessories: Accessory[];
  faqs: FaqItem[];
  testimonials: Testimonial[];
  knowledgeEntries: KnowledgeEntry[];
  onRefreshPublic: () => Promise<void>;
}

export function AdminDashboard({
  user,
  authLoading,
  isAdmin,
  isSeededInDb,
  settings,
  services,
  accessories,
  faqs,
  testimonials,
  knowledgeEntries,
  onRefreshPublic,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [loadingPrivate, setLoadingPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Local editable settings form
  const [settingsDraft, setSettingsDraft] = useState<ShopSettings>(settings);
  useEffect(() => {
    setSettingsDraft(settings);
  }, [settings]);

  // Quick-add forms
  const [newService, setNewService] = useState({
    name: '',
    category: 'hardware' as ServiceCategory,
    description: '',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: true,
  });

  const [newAccessory, setNewAccessory] = useState({
    name: '',
    category: ACCESSORY_CATEGORIES[0] as AccessoryCategory,
    description: '',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability' as AvailabilityStatus,
    imageUrl: STUDIO_IMAGES.chargingKit,
  });

  const [newFaq, setNewFaq] = useState({
    category: 'Repairs',
    question: '',
    answer: '',
  });

  const [newReview, setNewReview] = useState({
    customerName: '',
    deviceOrService: '',
    quote: '',
  });

  const [newKb, setNewKb] = useState({
    topic: '',
    category: 'policy' as KnowledgeCategory,
    content: '',
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  const loadPrivateData = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingPrivate(true);
    try {
      const data = await fetchAdminPrivateCollections();
      setRepairRequests(data.repairRequests);
      setInquiries(data.inquiries);
      setChatLogs(data.chatLogs);
    } catch (err) {
      console.error(err);
      showToast('Failed to load admin records.');
    } finally {
      setLoadingPrivate(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      void loadPrivateData();
    }
  }, [isAdmin, loadPrivateData]);

  async function handleGoogleLogin() {
    setAuthError(null);
    try {
      await signInAdminWithGoogle();
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : 'Unable to complete Google Sign-In.'
      );
    }
  }

  async function handleSeedDatabase() {
    setSaving(true);
    try {
      await seedInitialStorefrontData();
      await onRefreshPublic();
      showToast('Default HM Mobile services, accessories, FAQs, and settings saved to database.');
    } catch {
      showToast('Failed to initialize database records.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveShopSettings(settingsDraft);
      await onRefreshPublic();
      showToast('Shop settings saved and synced to website & AI chatbot.');
    } catch {
      showToast('Failed to save shop settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    if (newService.name.trim().length < 2 || newService.description.trim().length < 10) return;
    setSaving(true);
    try {
      const id = createSafeDocId('svc');
      await saveRepairService({
        id,
        slug: newService.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || id,
        name: newService.name,
        category: newService.category,
        description: newService.description,
        iconKey: 'wrench',
        priceLabel: newService.priceLabel || 'Contact for Confirmation',
        isConfirmedAvailable: newService.isConfirmedAvailable,
        isFeatured: false,
        sortOrder: services.length + 1,
      });
      setNewService({
        name: '',
        category: 'hardware',
        description: '',
        priceLabel: 'Contact for Confirmation',
        isConfirmedAvailable: true,
      });
      await onRefreshPublic();
      showToast('Repair service added.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAccessory(e: React.FormEvent) {
    e.preventDefault();
    if (newAccessory.name.trim().length < 2 || newAccessory.description.trim().length < 10) return;
    setSaving(true);
    try {
      const id = createSafeDocId('acc');
      await saveAccessory({
        id,
        slug: newAccessory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || id,
        name: newAccessory.name,
        category: newAccessory.category,
        description: newAccessory.description,
        priceLabel: newAccessory.priceLabel || 'Price on inquiry',
        availabilityStatus: newAccessory.availabilityStatus,
        imageUrl: newAccessory.imageUrl,
        isFeatured: false,
        sortOrder: accessories.length + 1,
      });
      setNewAccessory({
        name: '',
        category: ACCESSORY_CATEGORIES[0],
        description: '',
        priceLabel: 'Price on inquiry',
        availabilityStatus: 'confirm_availability',
        imageUrl: STUDIO_IMAGES.chargingKit,
      });
      await onRefreshPublic();
      showToast('Accessory added to catalog.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddFaq(e: React.FormEvent) {
    e.preventDefault();
    if (newFaq.question.trim().length < 5 || newFaq.answer.trim().length < 10) return;
    setSaving(true);
    try {
      await saveFaq({
        id: createSafeDocId('faq'),
        category: newFaq.category,
        question: newFaq.question,
        answer: newFaq.answer,
        sortOrder: faqs.length + 1,
        isPublished: true,
      });
      setNewFaq({ category: 'Repairs', question: '', answer: '' });
      await onRefreshPublic();
      showToast('FAQ published.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (newReview.customerName.trim().length < 2 || newReview.quote.trim().length < 10) return;
    setSaving(true);
    try {
      await saveTestimonial({
        id: createSafeDocId('rev'),
        customerName: newReview.customerName,
        deviceOrService: newReview.deviceOrService || 'Mobile Service',
        quote: newReview.quote,
        isPlaceholder: false,
        isPublished: true,
      });
      setNewReview({ customerName: '', deviceOrService: '', quote: '' });
      await onRefreshPublic();
      showToast('Verified customer review added.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddKb(e: React.FormEvent) {
    e.preventDefault();
    if (newKb.topic.trim().length < 2 || newKb.content.trim().length < 10) return;
    setSaving(true);
    try {
      await saveKnowledgeEntry({
        id: createSafeDocId('kb'),
        topic: newKb.topic,
        category: newKb.category,
        content: newKb.content,
        isActive: true,
      });
      setNewKb({ topic: '', category: 'policy', content: '' });
      await onRefreshPublic();
      showToast('AI knowledge article added.');
    } finally {
      setSaving(false);
    }
  }

  // Auth Gate
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-700" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="p-8 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 flex items-center justify-center mx-auto">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              HM Mobile Admin Portal
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sign in with your authorized Google account to manage repair requests, accessories, shop details, and AI chatbot knowledge.
            </p>
          </div>
          {authError && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg">
              {authError}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="p-8 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Admin Access Required
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Signed in as <span className="font-medium text-slate-900 dark:text-slate-100">{user.email}</span>, which does not have HM Mobile administrator permissions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOutAdmin()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'requests',
      label: 'Repair Requests',
      icon: <ClipboardList className="w-4 h-4" />,
      count: repairRequests.filter((r) => r.status === 'pending').length,
    },
    {
      id: 'inquiries',
      label: 'Customer Inquiries',
      icon: <Mail className="w-4 h-4" />,
      count: inquiries.filter((i) => i.status === 'new').length,
    },
    { id: 'services', label: 'Repair Services', icon: <Wrench className="w-4 h-4" /> },
    { id: 'accessories', label: 'Accessories Catalog', icon: <Package className="w-4 h-4" /> },
    { id: 'content', label: 'FAQs & Reviews', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'ai_kb', label: 'AI Knowledge & Logs', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'settings', label: 'Shop Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-xs font-medium shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as Admin</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void onRefreshPublic();
                  void loadPrivateData();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => void signOutAdmin()}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === item.id
                    ? 'bg-blue-700 dark:bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="font-mono-tabular text-[11px] opacity-90">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 min-w-0 space-y-6">
          {!isSeededInDb && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-950 dark:text-blue-200">
                  Initialize Firestore Catalog
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Save all 16 default repair services, 12 accessory categories, FAQs, placeholder reviews, and AI knowledge articles into Firestore so you can customize them permanently.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSeedDatabase()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap shrink-0"
              >
                <Database className="w-4 h-4" />
                Initialize Default Data
              </button>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Dashboard Overview
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Live storefront summary for {settings.businessName}.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Repair Requests</p>
                  <p className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-white mt-1">
                    {repairRequests.length}
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Customer Inquiries</p>
                  <p className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-white mt-1">
                    {inquiries.length}
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active Services</p>
                  <p className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-white mt-1">
                    {services.length}
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">AI Chat Turns Logged</p>
                  <p className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-white mt-1">
                    {chatLogs.length}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Recent Repair Requests
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('requests')}
                    className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    Manage all
                  </button>
                </div>
                {loadingPrivate ? (
                  <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
                ) : repairRequests.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No repair requests submitted yet. Incoming requests from the website form and AI chatbot will appear here.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3 font-medium">Ticket</th>
                          <th className="px-4 py-3 font-medium">Customer</th>
                          <th className="px-4 py-3 font-medium">Device & Service</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {repairRequests.slice(0, 6).map((req) => (
                          <tr key={req.id}>
                            <td className="px-4 py-3 font-mono-tabular font-medium text-slate-900 dark:text-slate-100">
                              {req.ticketCode}
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {req.customerName} · {req.contactInfo}
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {req.phoneModel} — {req.serviceName}
                            </td>
                            <td className="px-4 py-3 capitalize font-medium text-slate-800 dark:text-slate-200">
                              {req.status.replace('_', ' ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REPAIR REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Repair Requests ({repairRequests.length})
              </h1>
              {repairRequests.length === 0 ? (
                <div className="p-8 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                  No repair requests recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {repairRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                            {req.ticketCode}
                          </span>
                          <span>·</span>
                          <span>{req.source === 'ai_chatbot' ? 'Via AI Chatbot' : 'Via Website Form'}</span>
                          {req.createdAtMs && (
                            <>
                              <span>·</span>
                              <span className="tabular-nums">
                                {new Date(req.createdAtMs).toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={req.status}
                            onChange={async (e) => {
                              const nextStatus = e.target.value as RepairRequestStatus;
                              await updateRepairRequestStatus(req.id, nextStatus, req.adminNotes);
                              await loadPrivateData();
                              showToast(`Updated ${req.ticketCode} to ${nextStatus}`);
                            }}
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteRepairRequest(req.id);
                              await loadPrivateData();
                              showToast('Repair request deleted.');
                            }}
                            aria-label="Delete repair request"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p className="text-slate-900 dark:text-slate-100 font-medium">
                          {req.customerName} — <span className="font-mono-tabular">{req.contactInfo}</span>
                          {req.whatsappNumber ? ` (WA: ${req.whatsappNumber})` : ''}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">
                          {req.phoneModel} · {req.serviceName}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {req.problemDescription}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INQUIRIES TAB */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Customer Inquiries ({inquiries.length})
              </h1>
              {inquiries.length === 0 ? (
                <div className="p-8 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                  No customer inquiries submitted yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="capitalize font-semibold text-slate-900 dark:text-white">
                            {inq.inquiryType}
                          </span>
                          {inq.relatedItemName ? ` · ${inq.relatedItemName}` : ''}
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={inq.status}
                            onChange={async (e) => {
                              await updateInquiryStatus(inq.id, e.target.value as InquiryStatus);
                              await loadPrivateData();
                              showToast('Inquiry status updated.');
                            }}
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                          >
                            <option value="new">New</option>
                            <option value="replied">Replied</option>
                            <option value="archived">Archived</option>
                          </select>
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteInquiry(inq.id);
                              await loadPrivateData();
                              showToast('Inquiry deleted.');
                            }}
                            aria-label="Delete inquiry"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {inq.customerName} · <span className="font-mono-tabular">{inq.contactInfo}</span>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{inq.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REPAIR SERVICES MANAGER */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Manage Repair Services ({services.length})
              </h1>

              <form
                onSubmit={handleAddService}
                className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Add New Repair Service
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Service name"
                    value={newService.name}
                    onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))}
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                  <select
                    value={newService.category}
                    onChange={(e) =>
                      setNewService((p) => ({ ...p, category: e.target.value as ServiceCategory }))
                    }
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="diagnostics">Diagnostics</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Price label (e.g., Contact for Confirmation)"
                    value={newService.priceLabel}
                    onChange={(e) => setNewService((p) => ({ ...p, priceLabel: e.target.value }))}
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Professional service description..."
                  value={newService.description}
                  onChange={(e) => setNewService((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
                <div className="flex items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={newService.isConfirmedAvailable}
                      onChange={(e) =>
                        setNewService((p) => ({ ...p, isConfirmedAvailable: e.target.checked }))
                      }
                    />
                    Confirmed available at shop
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Service
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {svc.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {svc.category} · {svc.priceLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <input
                        type="text"
                        defaultValue={svc.priceLabel}
                        onBlur={async (e) => {
                          if (e.target.value !== svc.priceLabel) {
                            await saveRepairService({ ...svc, priceLabel: e.target.value });
                            await onRefreshPublic();
                            showToast(`Updated price label for ${svc.name}`);
                          }
                        }}
                        aria-label={`Price label for ${svc.name}`}
                        className="w-44 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await saveRepairService({
                            ...svc,
                            isConfirmedAvailable: !svc.isConfirmedAvailable,
                          });
                          await onRefreshPublic();
                          showToast(`Updated availability for ${svc.name}`);
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                          svc.isConfirmedAvailable
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {svc.isConfirmedAvailable ? 'Confirmed' : 'Unconfirmed'}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteRepairService(svc.id);
                          await onRefreshPublic();
                          showToast('Service removed.');
                        }}
                        aria-label={`Delete ${svc.name}`}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACCESSORIES MANAGER */}
          {activeTab === 'accessories' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Manage Accessories Catalog ({accessories.length})
              </h1>

              <form
                onSubmit={handleAddAccessory}
                className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Add New Accessory
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Product name"
                    value={newAccessory.name}
                    onChange={(e) => setNewAccessory((p) => ({ ...p, name: e.target.value }))}
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                  <select
                    value={newAccessory.category}
                    onChange={(e) =>
                      setNewAccessory((p) => ({
                        ...p,
                        category: e.target.value as AccessoryCategory,
                      }))
                    }
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    {ACCESSORY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Price (e.g., PKR 1,500 or Price on inquiry)"
                    value={newAccessory.priceLabel}
                    onChange={(e) =>
                      setNewAccessory((p) => ({ ...p, priceLabel: e.target.value }))
                    }
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                  <select
                    value={newAccessory.availabilityStatus}
                    onChange={(e) =>
                      setNewAccessory((p) => ({
                        ...p,
                        availabilityStatus: e.target.value as AvailabilityStatus,
                      }))
                    }
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="confirm_availability">Confirm Availability</option>
                    <option value="in_stock">In Stock</option>
                    <option value="limited_stock">Limited Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Accessory description..."
                  value={newAccessory.description}
                  onChange={(e) =>
                    setNewAccessory((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <select
                    value={newAccessory.imageUrl}
                    onChange={(e) =>
                      setNewAccessory((p) => ({ ...p, imageUrl: e.target.value }))
                    }
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value={STUDIO_IMAGES.chargingKit}>Photo: Charging & Power Studio</option>
                    <option value={STUDIO_IMAGES.audioWearables}>Photo: Audio & Wearables Studio</option>
                    <option value={STUDIO_IMAGES.protectionCases}>Photo: Cases & Glass Studio</option>
                  </select>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Accessory
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {accessories.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <input
                        type="text"
                        defaultValue={item.priceLabel}
                        onBlur={async (e) => {
                          if (e.target.value !== item.priceLabel) {
                            await saveAccessory({ ...item, priceLabel: e.target.value });
                            await onRefreshPublic();
                            showToast(`Updated price for ${item.name}`);
                          }
                        }}
                        aria-label={`Price for ${item.name}`}
                        className="w-36 px-2.5 py-1.5 text-xs font-mono-tabular rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                      <select
                        value={item.availabilityStatus}
                        onChange={async (e) => {
                          await saveAccessory({
                            ...item,
                            availabilityStatus: e.target.value as AvailabilityStatus,
                          });
                          await onRefreshPublic();
                          showToast(`Updated stock for ${item.name}`);
                        }}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      >
                        <option value="confirm_availability">Confirm Availability</option>
                        <option value="in_stock">In Stock</option>
                        <option value="limited_stock">Limited Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteAccessory(item.id);
                          await onRefreshPublic();
                          showToast('Accessory removed.');
                        }}
                        aria-label={`Delete ${item.name}`}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQS & REVIEWS TAB */}
          {activeTab === 'content' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  FAQs ({faqs.length})
                </h1>
                <form
                  onSubmit={handleAddFaq}
                  className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Category (e.g., Repairs)"
                      value={newFaq.category}
                      onChange={(e) => setNewFaq((p) => ({ ...p, category: e.target.value }))}
                      className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Question"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))}
                      className="sm:col-span-2 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Accurate answer..."
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add FAQ
                  </button>
                </form>

                <div className="space-y-2.5">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="p-4 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {faq.question}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{faq.answer}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteFaq(faq.id);
                          await onRefreshPublic();
                          showToast('FAQ deleted.');
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Customer Testimonials ({testimonials.length})
                </h2>
                <form
                  onSubmit={handleAddReview}
                  className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Customer Name"
                      value={newReview.customerName}
                      onChange={(e) =>
                        setNewReview((p) => ({ ...p, customerName: e.target.value }))
                      }
                      className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="Service / Device (e.g., iPhone Battery Replacement)"
                      value={newReview.deviceOrService}
                      onChange={(e) =>
                        setNewReview((p) => ({ ...p, deviceOrService: e.target.value }))
                      }
                      className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Verified customer quote..."
                    value={newReview.quote}
                    onChange={(e) => setNewReview((p) => ({ ...p, quote: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Publish Verified Review
                  </button>
                </form>

                <div className="space-y-2.5">
                  {testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {t.customerName}{' '}
                          <span className="font-normal text-xs text-slate-500">
                            · {t.deviceOrService} {t.isPlaceholder ? '(Placeholder)' : '(Verified)'}
                          </span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{t.quote}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteTestimonial(t.id);
                          await onRefreshPublic();
                          showToast('Testimonial removed.');
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI KNOWLEDGE BASE & CHAT LOGS */}
          {activeTab === 'ai_kb' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  AI Chatbot Business Knowledge
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Every active entry below is automatically injected into the Gemini customer support assistant so it answers from your verified HM Mobile rules and policies.
                </p>

                <form
                  onSubmit={handleAddKb}
                  className="p-5 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Topic title (e.g., Screen Warranty Policy)"
                      value={newKb.topic}
                      onChange={(e) => setNewKb((p) => ({ ...p, topic: e.target.value }))}
                      className="sm:col-span-2 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                    <select
                      value={newKb.category}
                      onChange={(e) =>
                        setNewKb((p) => ({ ...p, category: e.target.value as KnowledgeCategory }))
                      }
                      className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      <option value="policy">Policy</option>
                      <option value="warranty">Warranty</option>
                      <option value="repair_process">Repair Process</option>
                      <option value="shop_info">Shop Info</option>
                      <option value="pricing_note">Pricing Note</option>
                    </select>
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Verified information the AI chatbot should use when answering customers..."
                    value={newKb.content}
                    onChange={(e) => setNewKb((p) => ({ ...p, content: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Knowledge Entry
                  </button>
                </form>

                <div className="space-y-2.5">
                  {knowledgeEntries.map((kb) => (
                    <div
                      key={kb.id}
                      className="p-4 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {kb.topic}{' '}
                          <span className="font-normal text-xs text-slate-500">
                            · {kb.category.replace('_', ' ')}
                          </span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {kb.content}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteKnowledgeEntry(kb.id);
                          await onRefreshPublic();
                          showToast('Knowledge entry deleted.');
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Recent Customer Support Conversations ({chatLogs.length})
                </h2>
                {chatLogs.length === 0 ? (
                  <p className="text-sm text-slate-500">No chat conversations recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {chatLogs.slice(0, 25).map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-mono-tabular">
                            Session {log.sessionId.slice(0, 14)} · {log.languageHint}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteChatLog(log.id);
                              await loadPrivateData();
                            }}
                            className="text-slate-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          Customer: {log.userMessage}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                          Assistant: {log.assistantReply}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SHOP SETTINGS TAB */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Shop Settings & Content
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Update real shop contact details, hours, About Us copy, and AI chatbot instructions.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save All Changes
                </button>
              </div>

              <div className="p-6 rounded-xl bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsDraft.businessName}
                    onChange={(e) =>
                      setSettingsDraft((p) => ({ ...p, businessName: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Business Location Address
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsDraft.locationAddress}
                    onChange={(e) =>
                      setSettingsDraft((p) => ({ ...p, locationAddress: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., +92 300 1234567"
                    value={settingsDraft.phoneNumber}
                    onChange={(e) =>
                      setSettingsDraft((p) => ({ ...p, phoneNumber: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Number (with country code, e.g., 923001234567)
                  </label>
                  <input
                    type="text"
                    placeholder="923XXXXXXXXX"
                    value={settingsDraft.whatsappNumber}
                    onChange={(e) =>
                      setSettingsDraft((p) => ({ ...p, whatsappNumber: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="shop@example.com"
                    value={settingsDraft.email}
                    onChange={(e) => setSettingsDraft((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mon–Sat: 10:00 AM – 9:00 PM"
                    value={settingsDraft.openingHours}
                    onChange={(e) =>
                      setSettingsDraft((p) => ({ ...p, openingHours: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    About Us Introduction
                  </label>
                  <textarea
                    rows={3}
                    value={settingsDraft.aboutIntro}
                    onChange={(e) =>
                      setSettingsDraft((p) => ({ ...p, aboutIntro: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Chatbot Welcome Message
                  </label>
                  <textarea
                    rows={3}
                    value={settingsDraft.chatWelcomeMessage}
                    onChange={(e) =>
                      setSettingsDraft((p) => ({ ...p, chatWelcomeMessage: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Chatbot Custom Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={settingsDraft.chatbotCustomInstructions}
                    onChange={(e) =>
                      setSettingsDraft((p) => ({
                        ...p,
                        chatbotCustomInstructions: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
