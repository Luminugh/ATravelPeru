// Application Use Case - Get Tours Catalog
// Orchestrates fetching and formatting tour catalog

import type { ITourRepository } from "../../domain/models/repositories";
import type { Tour } from "../../domain/models/index";

export class GetToursCatalogUseCase {
  constructor(private tourRepository: ITourRepository) {}

  async execute(): Promise<Tour[]> {
    return await this.tourRepository.findAll();
  }
}
