export type ServiceCategory = 'hardware' | 'software' | 'diagnostics';

export type AccessoryCategory =
  | 'Mobile Chargers'
  | 'USB Cables'
  | 'Handsfree & Earphones'
  | 'Bluetooth Earbuds'
  | 'Power Banks'
  | 'Mobile Covers'
  | 'Screen Protectors'
  | 'Tempered Glass'
  | 'Mobile Holders'
  | 'Speakers'
  | 'Smart Watches'
  | 'Other Mobile Accessories';

export type AvailabilityStatus =
  | 'confirm_availability'
  | 'in_stock'
  | 'limited_stock'
  | 'out_of_stock';

export type RepairRequestStatus =
  | 'pending'
  | 'reviewing'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type InquiryStatus = 'new' | 'replied' | 'archived';

export type KnowledgeCategory =
  | 'policy'
  | 'warranty'
  | 'repair_process'
  | 'shop_info'
  | 'pricing_note';

export interface ShopSettings {
  id: string;
  businessName: string;
  tagline: string;
  locationAddress: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  openingHours: string;
  aboutIntro: string;
  aboutServicesSummary: string;
  missionStatement: string;
  customerSatisfactionNote: string;
  whyChooseUsNote: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  chatWelcomeMessage: string;
  chatbotCustomInstructions: string;
  chatDisclosureText: string;
}

export interface RepairService {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description: string;
  iconKey: string;
  priceLabel: string;
  isConfirmedAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export interface Accessory {
  id: string;
  slug: string;
  name: string;
  category: AccessoryCategory;
  description: string;
  priceLabel: string;
  availabilityStatus: AvailabilityStatus;
  imageUrl: string;
  isFeatured: boolean;
  sortOrder: number;
}

export interface RepairRequest {
  id: string;
  ticketCode: string;
  customerName: string;
  contactInfo: string;
  whatsappNumber: string;
  phoneModel: string;
  serviceName: string;
  problemDescription: string;
  source: 'website_form' | 'ai_chatbot';
  status: RepairRequestStatus;
  adminNotes: string;
  createdAtMs?: number;
}

export interface CustomerInquiry {
  id: string;
  inquiryType: 'general' | 'accessory' | 'service';
  customerName: string;
  contactInfo: string;
  relatedItemName: string;
  message: string;
  status: InquiryStatus;
  createdAtMs?: number;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface Testimonial {
  id: string;
  customerName: string;
  deviceOrService: string;
  quote: string;
  isPlaceholder: boolean;
  isPublished: boolean;
}

export interface KnowledgeEntry {
  id: string;
  topic: string;
  category: KnowledgeCategory;
  content: string;
  isActive: boolean;
}

export interface ChatLog {
  id: string;
  sessionId: string;
  userMessage: string;
  assistantReply: string;
  languageHint: string;
  createdAtMs?: number;
}

export interface ChatBookingDraft {
  customerName: string;
  contactInfo: string;
  whatsappNumber?: string;
  phoneModel: string;
  serviceName: string;
  problemDescription: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  bookingTicketCode?: string;
  suggestWhatsApp?: boolean;
  suggestBookingModal?: boolean;
  error?: boolean;
}

export type PublicPage = 'home' | 'repairs' | 'accessories' | 'about' | 'contact' | 'admin';
