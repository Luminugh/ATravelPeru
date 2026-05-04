// Application Use Case - Get WhatsApp Config
// Orchestrates fetching WhatsApp phone number from repository

import type { IAppConfigRepository } from "../../domain/models/repositories";

export class GetWhatsAppConfigUseCase {
  constructor(private appConfigRepository: IAppConfigRepository) {}

  async execute(): Promise<{ phone: string | null }> {
    const config = await this.appConfigRepository.getByKey("whatsapp_phone");
    const phone = config?.config_value ?? null;
    return { phone };
  }
}
