// Domain Service - Message Generation
// Pure business logic for building WhatsApp messages and links
// NO dependencies on Supabase, Astro, or fetch

import type { Tour } from "../models/index";

export class MessageService {
  /**
   * Build a reservation message for a tour
   * @param tour - Tour data
   * @returns Formatted message for WhatsApp
   */
  buildReservationMessage(tour: Tour): string {
    return `Hola, quiero reservar ${tour.titulo} (${tour.duracion}) por ${tour.precio}.`;
  }

  /**
   * Generate WhatsApp link for a message
   * @param phoneNumber - WhatsApp phone number (digits only, e.g., "51987654321")
   * @param message - Message to send
   * @returns WhatsApp web URL
   */
  generateWhatsAppLink(phoneNumber: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }

  /**
   * Complete workflow: build message and generate link
   * @param tour - Tour data
   * @param phoneNumber - WhatsApp phone number
   * @returns WhatsApp link ready to open
   */
  generateReservationLink(tour: Tour, phoneNumber: string): string {
    const message = this.buildReservationMessage(tour);
    return this.generateWhatsAppLink(phoneNumber, message);
  }

  /**
   * Validate phone number format
   * @param phoneNumber - Phone number to validate
   * @returns true if valid (has at least 9 digits)
   */
  isValidPhoneNumber(phoneNumber: string | null | undefined): boolean {
    if (!phoneNumber) return false;
    const digits = phoneNumber.replace(/\D/g, "");
    return digits.length >= 9;
  }
}
