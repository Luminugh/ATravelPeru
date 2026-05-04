// Application Use Case - Generate WhatsApp Link
// Orchestrates: Get tour + Get WhatsApp phone + Build message + Generate link

import type { Tour, IAppConfigRepository, ITourRepository } from "../../domain/models/index";
import { MessageService } from "../../domain/services/MessageService";
import { ValidationError } from "../../domain/errors/DomainError";

export class GenerateWhatsAppLinkUseCase {
  private messageService: MessageService;

  constructor(
    private tourRepository: ITourRepository,
    private appConfigRepository: IAppConfigRepository
  ) {
    this.messageService = new MessageService();
  }

  async execute(tourId: number): Promise<{ link: string; message: string }> {
    // Get tour
    const tour = await this.tourRepository.findById(tourId);
    if (!tour) {
      throw new ValidationError(`Tour with id ${tourId} not found`);
    }

    // Get WhatsApp phone from config
    const config = await this.appConfigRepository.getByKey("whatsapp_phone");
    const phoneNumber = config?.config_value;

    // Validate phone
    if (!this.messageService.isValidPhoneNumber(phoneNumber)) {
      throw new ValidationError("WhatsApp phone number not configured or invalid");
    }

    // Build message and link
    const message = this.messageService.buildReservationMessage(tour);
    const link = this.messageService.generateWhatsAppLink(phoneNumber!, message);

    return { link, message };
  }
}
