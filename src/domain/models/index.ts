// Domain Models - Pure types (NO Supabase dependencies)

export type AppConfig = {
  id: number;
  config_key: string;
  config_value: string | null;
  updated_at: string;
};

export type Tour = {
  id: number;
  titulo: string;
  descripcion: string;
  precio: string; // formatted as "S/ X,XXX.XX"
  duracion: string;
  ubicacion: string;
  incluye: string;
  no_incluye: string | null;
  itinerario: string | null;
  imagen_principal: string;
  galeria: string[];
  destacado: boolean;
  estado: "activo" | "inactivo";
  vendedor_id: string;
  created_at?: string;
  updated_at?: string;
};

export type Vendedor = {
  id: string; // UUID
  nombre: string | null;
  telefono: string | null;
  created_at: string;
};

export type Ubicacion = {
  id: number;
  nombre: string;
  created_at: string;
};

export type TourGaleria = {
  id: number;
  tour_id: number;
  imagen: string;
  created_at: string;
};
