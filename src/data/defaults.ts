import {
  Accessory,
  AccessoryCategory,
  FaqItem,
  KnowledgeEntry,
  RepairService,
  ShopSettings,
  Testimonial,
} from '../types';

export const STUDIO_IMAGES = {
  heroStudio: '/src/assets/images/hero_repair_studio_1795335560856.jpg',
  displayRepair: '/src/assets/images/service_display_repair_1795335567379.jpg',
  chargingKit: '/src/assets/images/accessories_charging_kit_1795335561159.jpg',
  audioWearables: '/src/assets/images/accessories_audio_wearables_1795335558972.jpg',
  protectionCases: '/src/assets/images/accessories_protection_cases_1795335560242.jpg',
};

export const ACCESSORY_CATEGORIES: AccessoryCategory[] = [
  'Mobile Chargers',
  'USB Cables',
  'Handsfree & Earphones',
  'Bluetooth Earbuds',
  'Power Banks',
  'Mobile Covers',
  'Screen Protectors',
  'Tempered Glass',
  'Mobile Holders',
  'Speakers',
  'Smart Watches',
  'Other Mobile Accessories',
];

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  id: 'main',
  businessName: 'HM Mobile',
  tagline: 'Smartphone Repairing, Hardware Diagnostics & Mobile Accessories',
  locationAddress: 'Main Auto Market, Rahim Yar Khan, Pakistan',
  phoneNumber: '',
  whatsappNumber: '',
  email: '',
  openingHours: 'Opening hours to be confirmed — contact HM Mobile before visiting',
  aboutIntro:
    'HM Mobile is a mobile phone service center and accessories shop located in Main Auto Market, Rahim Yar Khan, Pakistan. We assist smartphone users with practical hardware diagnostics, careful component repairs, legitimate software troubleshooting, and everyday mobile accessories.',
  aboutServicesSummary:
    'Our work spans hardware diagnostics and part replacements (screens, batteries, charging ports, cameras, speakers, and buttons), board-level inspection, legitimate software maintenance, data backup assistance, and curated smartphone accessories. Availability and estimates for each device model are confirmed upon inspection.',
  missionStatement:
    'Our mission is to provide clear communication, honest inspection feedback, and dependable care for every smartphone brought to our counter—without hidden charges or unsupported promises.',
  customerSatisfactionNote:
    'We believe trust is earned through transparency. Customers receive an upfront discussion of symptoms, part availability, and expected charges before confirming any repair work.',
  whyChooseUsNote:
    'Conveniently situated in Main Auto Market, Rahim Yar Khan, HM Mobile combines hands-on hardware and software troubleshooting with responsive digital support in English, Urdu, and Roman Urdu.',
  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  chatWelcomeMessage:
    'Welcome to HM Mobile! 👋\n\nHow can I help you today?\n\nAsk me about mobile repairing, accessories, smartphone problems, or our shop services.',
  chatbotCustomInstructions:
    'Always be courteous, concise, and helpful. Match the customer language naturally (English, Urdu, or Roman Urdu). Never guess prices, repair times, warranties, or stock availability—ask the customer to confirm directly with HM Mobile when details are not verified.',
  chatDisclosureText:
    'Support conversations may be reviewed by HM Mobile staff to improve service and assist with follow-up.',
};

export const DEFAULT_REPAIR_SERVICES: RepairService[] = [
  {
    id: 'lcd-display-replacement',
    slug: 'lcd-display-replacement',
    name: 'LCD & Display Replacement',
    category: 'hardware',
    description:
      'Inspection and replacement for cracked glass, dead pixels, display lines, flickering panels, or unresponsive touchscreens across supported Android and iPhone models.',
    iconKey: 'smartphone',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'battery-replacement',
    slug: 'battery-replacement',
    name: 'Battery Replacement',
    category: 'hardware',
    description:
      'Battery health inspection and replacement for rapid drain, sudden shutdowns, overheating during charging, or swollen cells.',
    iconKey: 'battery',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    id: 'charging-port-repair',
    slug: 'charging-port-repair',
    name: 'Charging Port Repair',
    category: 'hardware',
    description:
      'Cleaning, testing, and repair or replacement of loose, damaged, or non-charging USB-C, Lightning, and Micro-USB charging connectors.',
    iconKey: 'plug',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: true,
    sortOrder: 3,
  },
  {
    id: 'speaker-microphone-repair',
    slug: 'speaker-microphone-repair',
    name: 'Speaker & Microphone Repair',
    category: 'hardware',
    description:
      'Troubleshooting and repair for distorted loudspeaker audio, low earpiece call volume, or muted voice pickup during calls and recordings.',
    iconKey: 'volume',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: false,
    sortOrder: 4,
  },
  {
    id: 'camera-repair',
    slug: 'camera-repair',
    name: 'Camera Repair',
    category: 'hardware',
    description:
      'Front and rear camera module inspection, cracked camera lens glass assessment, and focus or black-screen camera troubleshooting.',
    iconKey: 'camera',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: true,
    sortOrder: 5,
  },
  {
    id: 'power-volume-button-repair',
    slug: 'power-volume-button-repair',
    name: 'Power & Volume Button Repair',
    category: 'hardware',
    description:
      'Assessment and repair for stuck, sunken, or unresponsive power and volume flex switches to restore reliable physical controls.',
    iconKey: 'sliders',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: false,
    sortOrder: 6,
  },
  {
    id: 'water-damage-inspection',
    slug: 'water-damage-inspection',
    name: 'Water Damage Inspection & Repair',
    category: 'diagnostics',
    description:
      'Internal moisture inspection, corrosion cleaning, and diagnostic testing after accidental spills or liquid exposure. Outcome depends on internal damage severity.',
    iconKey: 'droplets',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: true,
    sortOrder: 7,
  },
  {
    id: 'motherboard-troubleshooting',
    slug: 'motherboard-troubleshooting',
    name: 'Motherboard Troubleshooting',
    category: 'diagnostics',
    description:
      'Circuit-level diagnostic inspection for no-power devices, power IC faults, charging circuit shorts, and complex hardware failures.',
    iconKey: 'cpu',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: true,
    sortOrder: 8,
  },
  {
    id: 'software-installation',
    slug: 'software-installation',
    name: 'Software Installation',
    category: 'software',
    description:
      'Clean operating system reinstallation and essential software setup to resolve severe crashes, boot loops, or corrupted system files.',
    iconKey: 'download',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: false,
    sortOrder: 9,
  },
  {
    id: 'software-updates',
    slug: 'software-updates',
    name: 'Software Updates',
    category: 'software',
    description:
      'Assisted installation of official manufacturer firmware and security updates with guidance on backing up personal files beforehand.',
    iconKey: 'refresh',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: false,
    sortOrder: 10,
  },
  {
    id: 'mobile-flashing',
    slug: 'mobile-flashing',
    name: 'Mobile Flashing',
    category: 'software',
    description:
      'Official stock firmware flashing for phones stuck on the startup logo, experiencing system corruption, or failing to boot properly.',
    iconKey: 'terminal',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: false,
    sortOrder: 11,
  },
  {
    id: 'frp-account-troubleshooting',
    slug: 'frp-account-troubleshooting',
    name: 'FRP & Account Troubleshooting (Legitimate Ownership)',
    category: 'software',
    description:
      'Legitimate account recovery guidance and Factory Reset Protection troubleshooting strictly for verified device owners with proof of ownership.',
    iconKey: 'shield',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: false,
    sortOrder: 12,
  },
  {
    id: 'network-signal-troubleshooting',
    slug: 'network-signal-troubleshooting',
    name: 'Network & Signal Troubleshooting',
    category: 'diagnostics',
    description:
      'Hardware and software checks for no-service alerts, weak cellular reception, SIM tray reading errors, and Wi-Fi or Bluetooth instability.',
    iconKey: 'wifi',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: false,
    sortOrder: 13,
  },
  {
    id: 'hanging-performance-issues',
    slug: 'hanging-performance-issues',
    name: 'Mobile Hanging & Performance Issues',
    category: 'software',
    description:
      'Diagnostic cleanup and optimization for sluggish smartphones, frequent app freezes, storage bottlenecks, and unexpected restarts.',
    iconKey: 'gauge',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: false,
    sortOrder: 14,
  },
  {
    id: 'data-backup-transfer',
    slug: 'data-backup-transfer',
    name: 'Data Backup & Transfer Assistance',
    category: 'software',
    description:
      'Guided transfer of contacts, photos, documents, and messaging backups when upgrading to a new smartphone or preparing a device for repair.',
    iconKey: 'hard-drive',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: false,
    sortOrder: 15,
  },
  {
    id: 'other-mobile-services',
    slug: 'other-mobile-services',
    name: 'Other Mobile Hardware & Software Services',
    category: 'diagnostics',
    description:
      'Custom smartphone inspections, sensor troubleshooting, back-glass assessment, and general technical consultation tailored to your model.',
    iconKey: 'wrench',
    priceLabel: 'Contact for Confirmation',
    isConfirmedAvailable: false,
    isFeatured: false,
    sortOrder: 16,
  },
];

export const DEFAULT_ACCESSORIES: Accessory[] = [
  {
    id: 'mobile-chargers',
    slug: 'mobile-chargers',
    name: 'Fast & Standard Mobile Chargers',
    category: 'Mobile Chargers',
    description:
      'Wall adapters and fast-charging power bricks compatible with USB-C and standard USB mobile devices. Confirm wattage and model compatibility with our counter.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.chargingKit,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'usb-cables',
    slug: 'usb-cables',
    name: 'USB-C, Lightning & Micro-USB Cables',
    category: 'USB Cables',
    description:
      'Charging and data-sync cables designed for daily durability across Android and iPhone devices. Confirm cable type and current stock with HM Mobile.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.chargingKit,
    isFeatured: false,
    sortOrder: 2,
  },
  {
    id: 'handsfree-earphones',
    slug: 'handsfree-earphones',
    name: 'Wired Handsfree & Earphones',
    category: 'Handsfree & Earphones',
    description:
      'Wired 3.5mm and USB-C earphones with inline microphones for clear calls and everyday listening. Contact us to check available styles.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.audioWearables,
    isFeatured: false,
    sortOrder: 3,
  },
  {
    id: 'bluetooth-earbuds',
    slug: 'bluetooth-earbuds',
    name: 'Wireless Bluetooth Earbuds',
    category: 'Bluetooth Earbuds',
    description:
      'Compact wireless earbuds with portable charging cases suitable for calls, travel, and media. Confirm available models and pricing via inquiry.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.audioWearables,
    isFeatured: true,
    sortOrder: 4,
  },
  {
    id: 'power-banks',
    slug: 'power-banks',
    name: 'Portable Power Banks',
    category: 'Power Banks',
    description:
      'Backup battery packs for travel and load-shedding convenience. Contact HM Mobile to verify available capacity options and current pricing.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.chargingKit,
    isFeatured: true,
    sortOrder: 5,
  },
  {
    id: 'mobile-covers',
    slug: 'mobile-covers',
    name: 'Protective Mobile Covers & Cases',
    category: 'Mobile Covers',
    description:
      'Silicone, transparent, and rugged protective cases tailored to popular smartphone models. Share your exact model to confirm fit and availability.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.protectionCases,
    isFeatured: true,
    sortOrder: 6,
  },
  {
    id: 'screen-protectors',
    slug: 'screen-protectors',
    name: 'Hydrogel & Matte Screen Protectors',
    category: 'Screen Protectors',
    description:
      'Scratch-resistant flexible film and anti-glare protectors fitted cleanly at our counter. Confirm compatibility for your smartphone screen.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.protectionCases,
    isFeatured: false,
    sortOrder: 7,
  },
  {
    id: 'tempered-glass',
    slug: 'tempered-glass',
    name: 'Tempered Glass Display Protection',
    category: 'Tempered Glass',
    description:
      'Edge-to-edge clear and privacy tempered glass options to help protect smartphone displays from everyday scuffs and drops.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.protectionCases,
    isFeatured: true,
    sortOrder: 8,
  },
  {
    id: 'mobile-holders',
    slug: 'mobile-holders',
    name: 'Desk & Car Mobile Holders',
    category: 'Mobile Holders',
    description:
      'Adjustable desk stands and dashboard phone mounts for safe navigation and hands-free viewing. Confirm models available in store.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.protectionCases,
    isFeatured: false,
    sortOrder: 9,
  },
  {
    id: 'portable-speakers',
    slug: 'portable-speakers',
    name: 'Bluetooth Portable Speakers',
    category: 'Speakers',
    description:
      'Compact wireless speakers for clear room audio and portable playback. Contact our shop to check current stock and pricing.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.audioWearables,
    isFeatured: false,
    sortOrder: 10,
  },
  {
    id: 'smart-watches',
    slug: 'smart-watches',
    name: 'Smart Watches & Bands',
    category: 'Smart Watches',
    description:
      'Everyday smart watches and replacement straps for notifications and fitness tracking. Inquire for currently stocked models and prices.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.audioWearables,
    isFeatured: true,
    sortOrder: 11,
  },
  {
    id: 'other-mobile-accessories',
    slug: 'other-mobile-accessories',
    name: 'Other Mobile Accessories',
    category: 'Other Mobile Accessories',
    description:
      'OTG adapters, SIM ejector kits, memory cards, audio converters, and specialty smartphone add-ons. Ask our team for specific items.',
    priceLabel: 'Price on inquiry',
    availabilityStatus: 'confirm_availability',
    imageUrl: STUDIO_IMAGES.chargingKit,
    isFeatured: false,
    sortOrder: 12,
  },
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-quote-process',
    category: 'Repairs',
    question: 'How do I get a repair cost estimate for my phone?',
    answer:
      'Repair charges depend on your exact phone model, part quality options, and the fault found during inspection. You can submit a repair request on this website or contact HM Mobile directly so our technician can confirm part availability and pricing before any work starts.',
    sortOrder: 1,
    isPublished: true,
  },
  {
    id: 'faq-turnaround',
    category: 'Repairs',
    question: 'How long does a mobile repair take?',
    answer:
      'Completion time depends on the type of issue, diagnostic findings, and whether replacement parts need to be sourced for your specific model. An estimated timeline is confirmed only after inspecting the device at HM Mobile.',
    sortOrder: 2,
    isPublished: true,
  },
  {
    id: 'faq-data-safety',
    category: 'Software & Data',
    question: 'Will my personal data remain safe during a repair?',
    answer:
      'We recommend backing up important photos, contacts, and chats before any hardware or software service. Certain software procedures such as flashing or factory resets may erase device data, and we can discuss data backup options with you before proceeding.',
    sortOrder: 3,
    isPublished: true,
  },
  {
    id: 'faq-accessories-stock',
    category: 'Accessories',
    question: 'Are all listed mobile accessories currently in stock?',
    answer:
      'Our accessories catalog shows the categories HM Mobile carries. Because stock and pricing vary by phone model and brand, please send an inquiry or contact us to confirm live availability and exact pricing before visiting.',
    sortOrder: 4,
    isPublished: true,
  },
  {
    id: 'faq-water-damage',
    category: 'Diagnostics',
    question: 'What should I do if my phone falls into water?',
    answer:
      'Power off the phone immediately if safe, do not plug it into a charger, avoid shaking or using high heat like a hairdryer, and bring it in for professional internal moisture inspection as soon as possible.',
    sortOrder: 5,
    isPublished: true,
  },
  {
    id: 'faq-frp-policy',
    category: 'Software & Data',
    question: 'Do you assist with account or FRP lock issues?',
    answer:
      'HM Mobile provides legitimate account and FRP troubleshooting strictly for verified device owners who can confirm lawful ownership of the phone. We do not assist with bypassing security on unauthorized devices.',
    sortOrder: 6,
    isPublished: true,
  },
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 'placeholder-review-1',
    customerName: 'Verified Customer Review Slot #1',
    deviceOrService: 'Display & Hardware Repair · Placeholder',
    quote:
      'Placeholder testimonial slot — replace this card with a real customer review in the HM Mobile Admin Dashboard once collected.',
    isPlaceholder: true,
    isPublished: true,
  },
  {
    id: 'placeholder-review-2',
    customerName: 'Verified Customer Review Slot #2',
    deviceOrService: 'Charging & Battery Service · Placeholder',
    quote:
      'Placeholder testimonial slot — publish genuine Rahim Yar Khan customer feedback from the Admin Dashboard at any time.',
    isPlaceholder: true,
    isPublished: true,
  },
  {
    id: 'placeholder-review-3',
    customerName: 'Verified Customer Review Slot #3',
    deviceOrService: 'Mobile Accessories & Support · Placeholder',
    quote:
      'Placeholder testimonial slot — HM Mobile never invents fake reviews; edit or unpublish placeholder cards directly in Admin.',
    isPlaceholder: true,
    isPublished: true,
  },
];

export const DEFAULT_KNOWLEDGE_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'kb-location-overview',
    topic: 'Shop Location & Identity',
    category: 'shop_info',
    content:
      'HM Mobile is located at Main Auto Market, Rahim Yar Khan, Pakistan. We handle mobile phone repairing, hardware diagnostics, software troubleshooting, and mobile accessories.',
    isActive: true,
  },
  {
    id: 'kb-pricing-confirmation',
    topic: 'Pricing & Estimate Policy',
    category: 'pricing_note',
    content:
      'Do not quote fixed repair or accessory prices unless explicitly entered in the catalog. Explain that pricing depends on the exact phone model, fault, and part availability, and must be confirmed directly with HM Mobile.',
    isActive: true,
  },
  {
    id: 'kb-warranty-policy',
    topic: 'Warranty Confirmation Policy',
    category: 'warranty',
    content:
      'Warranty terms are not standardized online. Customers should confirm any applicable repair or accessory warranty terms directly at the HM Mobile counter before proceeding.',
    isActive: true,
  },
  {
    id: 'kb-repair-booking-flow',
    topic: 'Repair Request & Inspection Procedure',
    category: 'repair_process',
    content:
      'Customers can submit a repair request online or through this assistant by providing their name, mobile model, problem description, and contact number. Submitting a request logs a ticket for HM Mobile staff review; final appointment timing and cost are confirmed after review/inspection.',
    isActive: true,
  },
  {
    id: 'kb-legitimate-software',
    topic: 'Legitimate Software & Account Troubleshooting',
    category: 'policy',
    content:
      'Software updates, flashing, data transfer, and FRP/account troubleshooting are offered strictly for legitimate device owners. Never provide instructions to bypass security protections or perform dangerous DIY battery/electrical work.',
    isActive: true,
  },
];

export const QUICK_CHAT_PROMPTS: string[] = [
  'What mobile repairing services do you offer?',
  'Do you repair charging problems?',
  'Which accessories are available?',
  'Where is HM Mobile located?',
  'I want to book a repair.',
  'Contact us on WhatsApp.',
];

export function formatWhatsAppUrl(rawNumber: string, message: string): string | null {
  const digits = rawNumber.replace(/[^\d]/g, '');
  if (!digits || digits.length < 7) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function generateTicketCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `HM-${num}`;
}

export function createSafeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}
