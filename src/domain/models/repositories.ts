// Repository Interfaces - Define contracts for infrastructure

import type { AppConfig, Tour, Vendedor, Ubicacion } from "../models/index";

export interface IAppConfigRepository {
  getByKey(key: string): Promise<AppConfig | null>;
  upsert(key: string, value: string): Promise<AppConfig>;
}

export interface ITourRepository {
  findAll(): Promise<Tour[]>;
  findById(id: number): Promise<Tour | null>;
  findByVendorId(vendorId: string): Promise<Tour[]>;
}

export interface IVendedorRepository {
  findById(id: string): Promise<Vendedor | null>;
  exists(id: string): Promise<boolean>;
}

export interface IUbicacionRepository {
  findAll(): Promise<Ubicacion[]>;
  findById(id: number): Promise<Ubicacion | null>;
  create(nombre: string): Promise<Ubicacion>;
}
