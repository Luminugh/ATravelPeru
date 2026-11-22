import type { ITourRepository } from "../../domain/models/repositories";
import type { Tour } from "../../domain/models";

export class GetTourByIdUseCase {
  constructor(private readonly tourRepository: ITourRepository) {}

  execute(id: number): Promise<Tour | null> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      return Promise.resolve(null);
    }

    return this.tourRepository.findById(id);
  }
}
