import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle, X } from 'lucide-react';
import { formatWhatsAppUrl } from '../data/defaults';
import { submitCustomerInquiry, submitRepairRequest } from '../lib/firebase';
import type { RepairService, ShopSettings } from '../types';

interface RepairBookingModalProps {
  open: boolean;
  onClose: () => void;
  services: RepairService[];
  settings: ShopSettings;
  preselectedService?: string;
}

export function RepairBookingModal({
  open,
  onClose,
  services,
  settings,
  preselectedService,
}: RepairBookingModalProps) {
  const [serviceName, setServiceName] = useState(preselectedService || services[0]?.name || 'LCD & Display Replacement');
  const [phoneModel, setPhoneModel] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketCode, setTicketCode] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setServiceName(preselectedService || services[0]?.name || 'LCD & Display Replacement');
      setError(null);
      setTicketCode(null);
    }
  }, [open, preselectedService, services]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (customerName.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (contactInfo.trim().length < 4) {
      setError('Please enter a valid phone number or contact detail.');
      return;
    }
    if (phoneModel.trim().length < 2) {
      setError('Please specify your mobile phone brand and model.');
      return;
    }
    if (problemDescription.trim().length < 5) {
      setError('Please briefly describe the issue so our technician can review it.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitRepairRequest({
        customerName,
        contactInfo,
        whatsappNumber,
        phoneModel,
        serviceName,
        problemDescription,
        source: 'website_form',
      });
      setTicketCode(result.ticketCode);
      setPhoneModel('');
      setProblemDescription('');
    } catch (err) {
      console.error(err);
      setError('Could not save your repair request right now. Please try again or reach out via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  const waHref = formatWhatsAppUrl(
    settings.whatsappNumber,
    `Assalam-o-Alaikum HM Mobile, I submitted a repair request${
      ticketCode ? ` (Ref: ${ticketCode})` : ''
    } for ${serviceName}. Phone model: ${phoneModel || 'Not specified'}.`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repair-modal-title"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2
              id="repair-modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Request a Mobile Repair
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pricing and repair completion times are confirmed after inspection.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {ticketCode ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Repair Request Recorded
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your request has been logged for review by HM Mobile. Final availability,
                  pricing, and timing will be confirmed directly with you.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Reference Ticket</p>
                <p className="text-xl font-semibold font-mono-tabular text-slate-900 dark:text-slate-100 mt-0.5">
                  {ticketCode}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Follow Up on WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Repair Service
                </label>
                <select
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.name}>
                      {svc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Brand & Model *
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g., Samsung Galaxy A54, iPhone 13, Vivo Y22"
                  value={phoneModel}
                  onChange={(e) => setPhoneModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Problem Description *
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={1500}
                  placeholder="Describe what happened and any symptoms you noticed..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone or Contact Info *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    placeholder="03XX-XXXXXXX"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  WhatsApp Number (Optional)
                </label>
                <input
                  type="text"
                  maxLength={40}
                  placeholder="Optional — only if you prefer WhatsApp updates"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 rounded-lg transition-colors"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Repair Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

interface InquiryModalProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
  inquiryType: 'accessory' | 'service' | 'general';
  settings: ShopSettings;
}

export function InquiryModal({
  open,
  onClose,
  itemName,
  inquiryType,
  settings,
}: InquiryModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setSent(false);
      setMessage(
        itemName
          ? `Please confirm current availability and price for: ${itemName}.`
          : ''
      );
    }
  }, [open, itemName]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (customerName.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (contactInfo.trim().length < 4) {
      setError('Please enter your phone number or contact info.');
      return;
    }
    if (message.trim().length < 5) {
      setError('Please enter your inquiry message.');
      return;
    }

    setSubmitting(true);
    try {
      await submitCustomerInquiry({
        inquiryType,
        customerName,
        contactInfo,
        relatedItemName: itemName,
        message,
      });
      setSent(true);
    } catch (err) {
      console.error(err);
      setError('Unable to submit inquiry right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const waHref = formatWhatsAppUrl(
    settings.whatsappNumber,
    `Assalam-o-Alaikum HM Mobile, I would like to inquire about: ${itemName || 'your shop services'}.`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2
              id="inquiry-modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Product & Service Inquiry
            </h2>
            {itemName && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                {itemName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {sent ? (
            <div className="space-y-4 text-center py-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Inquiry Sent to HM Mobile
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Our shop team will review your inquiry and confirm stock and pricing directly.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message on WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone or WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Message & Phone Model *
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={1500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 rounded-lg transition-colors"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Inquiry
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
