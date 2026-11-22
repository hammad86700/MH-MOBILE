import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  DEFAULT_ACCESSORIES,
  DEFAULT_FAQS,
  DEFAULT_KNOWLEDGE_ENTRIES,
  DEFAULT_REPAIR_SERVICES,
  DEFAULT_SHOP_SETTINGS,
  DEFAULT_TESTIMONIALS,
  createSafeDocId,
  generateTicketCode,
} from '../data/defaults';
import type {
  Accessory,
  ChatLog,
  CustomerInquiry,
  FaqItem,
  KnowledgeEntry,
  RepairRequest,
  RepairRequestStatus,
  RepairService,
  ShopSettings,
  Testimonial,
  InquiryStatus,
} from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const BOOTSTRAP_ADMIN_EMAIL = 'mh9345174@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

function toMillis(ts: unknown): number | undefined {
  if (!ts) return undefined;
  if (typeof ts === 'object' && ts !== null && 'toMillis' in ts) {
    return (ts as Timestamp).toMillis();
  }
  return undefined;
}

export async function signInAdminWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export async function checkIsUserAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export interface StorefrontSnapshot {
  settings: ShopSettings;
  services: RepairService[];
  accessories: Accessory[];
  faqs: FaqItem[];
  testimonials: Testimonial[];
  knowledgeEntries: KnowledgeEntry[];
  isSeededInDb: boolean;
}

export async function fetchStorefrontSnapshot(): Promise<StorefrontSnapshot> {
  try {
    const [settingsSnap, servicesSnap, accessoriesSnap, faqsSnap, testimonialsSnap, kbSnap] =
      await Promise.all([
        getDoc(doc(db, 'shop_settings', 'main')),
        getDocs(collection(db, 'repair_services')),
        getDocs(collection(db, 'accessories')),
        getDocs(collection(db, 'faqs')),
        getDocs(collection(db, 'testimonials')),
        getDocs(collection(db, 'knowledge_entries')),
      ]);

    const isSeededInDb =
      settingsSnap.exists() || !servicesSnap.empty || !accessoriesSnap.empty;

    const settings: ShopSettings = settingsSnap.exists()
      ? {
          ...DEFAULT_SHOP_SETTINGS,
          ...(settingsSnap.data() as Partial<ShopSettings>),
          id: settingsSnap.id,
        }
      : DEFAULT_SHOP_SETTINGS;

    const services: RepairService[] = !servicesSnap.empty
      ? servicesSnap.docs
          .map((d) => ({ ...(d.data() as Omit<RepairService, 'id'>), id: d.id }))
          .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
      : DEFAULT_REPAIR_SERVICES;

    const accessories: Accessory[] = !accessoriesSnap.empty
      ? accessoriesSnap.docs
          .map((d) => ({ ...(d.data() as Omit<Accessory, 'id'>), id: d.id }))
          .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
      : DEFAULT_ACCESSORIES;

    const faqs: FaqItem[] = !faqsSnap.empty
      ? faqsSnap.docs
          .map((d) => ({ ...(d.data() as Omit<FaqItem, 'id'>), id: d.id }))
          .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
      : DEFAULT_FAQS;

    const testimonials: Testimonial[] = !testimonialsSnap.empty
      ? testimonialsSnap.docs.map((d) => ({
          ...(d.data() as Omit<Testimonial, 'id'>),
          id: d.id,
        }))
      : DEFAULT_TESTIMONIALS;

    const knowledgeEntries: KnowledgeEntry[] = !kbSnap.empty
      ? kbSnap.docs.map((d) => ({
          ...(d.data() as Omit<KnowledgeEntry, 'id'>),
          id: d.id,
        }))
      : DEFAULT_KNOWLEDGE_ENTRIES;

    return {
      settings,
      services,
      accessories,
      faqs,
      testimonials,
      knowledgeEntries,
      isSeededInDb,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'storefront_snapshot');
  }
}

export async function seedInitialStorefrontData(): Promise<void> {
  try {
    const batch = writeBatch(db);
    const { id: _settingsId, ...settingsBody } = DEFAULT_SHOP_SETTINGS;
    batch.set(doc(db, 'shop_settings', 'main'), {
      ...settingsBody,
      updatedAt: serverTimestamp(),
    });

    for (const svc of DEFAULT_REPAIR_SERVICES) {
      const { id, ...body } = svc;
      batch.set(doc(db, 'repair_services', id), {
        ...body,
        updatedAt: serverTimestamp(),
      });
    }

    for (const acc of DEFAULT_ACCESSORIES) {
      const { id, ...body } = acc;
      batch.set(doc(db, 'accessories', id), {
        ...body,
        updatedAt: serverTimestamp(),
      });
    }

    for (const faq of DEFAULT_FAQS) {
      const { id, ...body } = faq;
      batch.set(doc(db, 'faqs', id), {
        ...body,
        updatedAt: serverTimestamp(),
      });
    }

    for (const t of DEFAULT_TESTIMONIALS) {
      const { id, ...body } = t;
      batch.set(doc(db, 'testimonials', id), {
        ...body,
        updatedAt: serverTimestamp(),
      });
    }

    for (const kb of DEFAULT_KNOWLEDGE_ENTRIES) {
      const { id, ...body } = kb;
      batch.set(doc(db, 'knowledge_entries', id), {
        ...body,
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed_initial_data');
  }
}

export async function submitRepairRequest(input: {
  customerName: string;
  contactInfo: string;
  whatsappNumber?: string;
  phoneModel: string;
  serviceName: string;
  problemDescription: string;
  source: 'website_form' | 'ai_chatbot';
}): Promise<{ id: string; ticketCode: string }> {
  const id = createSafeDocId('req');
  const ticketCode = generateTicketCode();
  const payload = {
    ticketCode,
    customerName: input.customerName.trim().slice(0, 100),
    contactInfo: input.contactInfo.trim().slice(0, 120),
    whatsappNumber: (input.whatsappNumber ?? '').trim().slice(0, 40),
    phoneModel: input.phoneModel.trim().slice(0, 120),
    serviceName: input.serviceName.trim().slice(0, 140),
    problemDescription: input.problemDescription.trim().slice(0, 1500),
    source: input.source,
    status: 'pending' as const,
    adminNotes: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'repair_requests', id), payload);
    return { id, ticketCode };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `repair_requests/${id}`);
  }
}

export async function submitCustomerInquiry(input: {
  inquiryType: 'general' | 'accessory' | 'service';
  customerName: string;
  contactInfo: string;
  relatedItemName?: string;
  message: string;
}): Promise<{ id: string }> {
  const id = createSafeDocId('inq');
  const payload = {
    inquiryType: input.inquiryType,
    customerName: input.customerName.trim().slice(0, 100),
    contactInfo: input.contactInfo.trim().slice(0, 120),
    relatedItemName: (input.relatedItemName ?? '').trim().slice(0, 160),
    message: input.message.trim().slice(0, 1500),
    status: 'new' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'customer_inquiries', id), payload);
    return { id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `customer_inquiries/${id}`);
  }
}

export async function recordChatExchange(input: {
  sessionId: string;
  userMessage: string;
  assistantReply: string;
  languageHint?: string;
}): Promise<void> {
  const id = createSafeDocId('chat');
  const payload = {
    sessionId: input.sessionId.trim().slice(0, 80),
    userMessage: input.userMessage.trim().slice(0, 1500),
    assistantReply: input.assistantReply.trim().slice(0, 3000),
    languageHint: (input.languageHint ?? 'auto').trim().slice(0, 40),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'chat_logs', id), payload);
  } catch (error) {
    console.warn('Chat log storage skipped:', error);
  }
}

// --- Admin Private Reads & CRUD ---

export async function fetchAdminPrivateCollections(): Promise<{
  repairRequests: RepairRequest[];
  inquiries: CustomerInquiry[];
  chatLogs: ChatLog[];
}> {
  try {
    const [reqSnap, inqSnap, chatSnap] = await Promise.all([
      getDocs(query(collection(db, 'repair_requests'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'customer_inquiries'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'chat_logs'), orderBy('createdAt', 'desc'))),
    ]);

    const repairRequests: RepairRequest[] = reqSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ticketCode: String(data.ticketCode ?? ''),
        customerName: String(data.customerName ?? ''),
        contactInfo: String(data.contactInfo ?? ''),
        whatsappNumber: String(data.whatsappNumber ?? ''),
        phoneModel: String(data.phoneModel ?? ''),
        serviceName: String(data.serviceName ?? ''),
        problemDescription: String(data.problemDescription ?? ''),
        source: data.source === 'ai_chatbot' ? 'ai_chatbot' : 'website_form',
        status: (data.status ?? 'pending') as RepairRequestStatus,
        adminNotes: String(data.adminNotes ?? ''),
        createdAtMs: toMillis(data.createdAt),
      };
    });

    const inquiries: CustomerInquiry[] = inqSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        inquiryType: (data.inquiryType ?? 'general') as CustomerInquiry['inquiryType'],
        customerName: String(data.customerName ?? ''),
        contactInfo: String(data.contactInfo ?? ''),
        relatedItemName: String(data.relatedItemName ?? ''),
        message: String(data.message ?? ''),
        status: (data.status ?? 'new') as InquiryStatus,
        createdAtMs: toMillis(data.createdAt),
      };
    });

    const chatLogs: ChatLog[] = chatSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        sessionId: String(data.sessionId ?? ''),
        userMessage: String(data.userMessage ?? ''),
        assistantReply: String(data.assistantReply ?? ''),
        languageHint: String(data.languageHint ?? 'auto'),
        createdAtMs: toMillis(data.createdAt),
      };
    });

    return { repairRequests, inquiries, chatLogs };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'admin_private_collections');
  }
}

export async function saveShopSettings(settings: ShopSettings): Promise<void> {
  const { id: _id, ...body } = settings;
  try {
    await setDoc(doc(db, 'shop_settings', 'main'), {
      businessName: body.businessName.trim().slice(0, 100),
      tagline: body.tagline.trim().slice(0, 240),
      locationAddress: body.locationAddress.trim().slice(0, 240),
      phoneNumber: body.phoneNumber.trim().slice(0, 60),
      whatsappNumber: body.whatsappNumber.trim().slice(0, 60),
      email: body.email.trim().slice(0, 120),
      openingHours: body.openingHours.trim().slice(0, 200),
      aboutIntro: body.aboutIntro.trim().slice(0, 2000),
      aboutServicesSummary: body.aboutServicesSummary.trim().slice(0, 1500),
      missionStatement: body.missionStatement.trim().slice(0, 1500),
      customerSatisfactionNote: body.customerSatisfactionNote.trim().slice(0, 1500),
      whyChooseUsNote: body.whyChooseUsNote.trim().slice(0, 1500),
      facebookUrl: body.facebookUrl.trim().slice(0, 300),
      instagramUrl: body.instagramUrl.trim().slice(0, 300),
      tiktokUrl: body.tiktokUrl.trim().slice(0, 300),
      chatWelcomeMessage: body.chatWelcomeMessage.trim().slice(0, 800),
      chatbotCustomInstructions: body.chatbotCustomInstructions.trim().slice(0, 3000),
      chatDisclosureText: body.chatDisclosureText.trim().slice(0, 300),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'shop_settings/main');
  }
}

export async function saveRepairService(service: RepairService): Promise<void> {
  const docId = service.id || createSafeDocId('svc');
  try {
    await setDoc(doc(db, 'repair_services', docId), {
      slug: service.slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 100) || docId,
      name: service.name.trim().slice(0, 120),
      category: service.category,
      description: service.description.trim().slice(0, 800),
      iconKey: service.iconKey.trim().slice(0, 40) || 'wrench',
      priceLabel: service.priceLabel.trim().slice(0, 100) || 'Contact for Confirmation',
      isConfirmedAvailable: Boolean(service.isConfirmedAvailable),
      isFeatured: Boolean(service.isFeatured),
      sortOrder: Math.max(0, Math.min(1000, Number(service.sortOrder) || 0)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `repair_services/${docId}`);
  }
}

export async function deleteRepairService(serviceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'repair_services', serviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `repair_services/${serviceId}`);
  }
}

export async function saveAccessory(accessory: Accessory): Promise<void> {
  const docId = accessory.id || createSafeDocId('acc');
  try {
    await setDoc(doc(db, 'accessories', docId), {
      slug: accessory.slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 100) || docId,
      name: accessory.name.trim().slice(0, 140),
      category: accessory.category,
      description: accessory.description.trim().slice(0, 800),
      priceLabel: accessory.priceLabel.trim().slice(0, 100) || 'Price on inquiry',
      availabilityStatus: accessory.availabilityStatus,
      imageUrl: accessory.imageUrl.trim().slice(0, 400),
      isFeatured: Boolean(accessory.isFeatured),
      sortOrder: Math.max(0, Math.min(1000, Number(accessory.sortOrder) || 0)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `accessories/${docId}`);
  }
}

export async function deleteAccessory(accessoryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'accessories', accessoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `accessories/${accessoryId}`);
  }
}

export async function updateRepairRequestStatus(
  requestId: string,
  status: RepairRequestStatus,
  adminNotes: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'repair_requests', requestId), {
      status,
      adminNotes: adminNotes.trim().slice(0, 1000),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `repair_requests/${requestId}`);
  }
}

export async function deleteRepairRequest(requestId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'repair_requests', requestId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `repair_requests/${requestId}`);
  }
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'customer_inquiries', inquiryId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `customer_inquiries/${inquiryId}`);
  }
}

export async function deleteInquiry(inquiryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'customer_inquiries', inquiryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `customer_inquiries/${inquiryId}`);
  }
}

export async function saveFaq(faq: FaqItem): Promise<void> {
  const docId = faq.id || createSafeDocId('faq');
  try {
    await setDoc(doc(db, 'faqs', docId), {
      category: faq.category.trim().slice(0, 60) || 'General',
      question: faq.question.trim().slice(0, 240),
      answer: faq.answer.trim().slice(0, 1200),
      sortOrder: Math.max(0, Math.min(1000, Number(faq.sortOrder) || 0)),
      isPublished: Boolean(faq.isPublished),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `faqs/${docId}`);
  }
}

export async function deleteFaq(faqId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'faqs', faqId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `faqs/${faqId}`);
  }
}

export async function saveTestimonial(item: Testimonial): Promise<void> {
  const docId = item.id || createSafeDocId('rev');
  try {
    await setDoc(doc(db, 'testimonials', docId), {
      customerName: item.customerName.trim().slice(0, 100),
      deviceOrService: item.deviceOrService.trim().slice(0, 120),
      quote: item.quote.trim().slice(0, 600),
      isPlaceholder: Boolean(item.isPlaceholder),
      isPublished: Boolean(item.isPublished),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `testimonials/${docId}`);
  }
}

export async function deleteTestimonial(testimonialId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'testimonials', testimonialId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `testimonials/${testimonialId}`);
  }
}

export async function saveKnowledgeEntry(entry: KnowledgeEntry): Promise<void> {
  const docId = entry.id || createSafeDocId('kb');
  try {
    await setDoc(doc(db, 'knowledge_entries', docId), {
      topic: entry.topic.trim().slice(0, 140),
      category: entry.category,
      content: entry.content.trim().slice(0, 2000),
      isActive: Boolean(entry.isActive),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `knowledge_entries/${docId}`);
  }
}

export async function deleteKnowledgeEntry(entryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'knowledge_entries', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `knowledge_entries/${entryId}`);
  }
}

export async function deleteChatLog(logId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'chat_logs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `chat_logs/${logId}`);
  }
}
