import { GetTourByIdUseCase } from "../application/use-cases/GetTourByIdUseCase";
import { GetToursCatalogUseCase } from "../application/use-cases/GetToursCatalogUseCase";
import { SupabaseTourRepository } from "./repositories/SupabaseTourRepository";

const tourRepository = new SupabaseTourRepository();

export const tourUseCases = {
  getCatalog: new GetToursCatalogUseCase(tourRepository),
  getById: new GetTourByIdUseCase(tourRepository),
};
