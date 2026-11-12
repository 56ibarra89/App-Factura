import type { PackagingSizeConfig } from "../model/catalog.types";
import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "../../../shared/api";

const PACKAGING_SIZES_KEY = "packaging_sizes";

type LegacyPackagingSize = string | PackagingSizeConfig;

interface PackagingSizesPayload {
  sizes?: LegacyPackagingSize[];
}

export interface PackagingConfigGateway {
  load(): Promise<PackagingSizeConfig[] | null>;
  save(sizes: PackagingSizeConfig[]): Promise<void>;
}

export function createPackagingConfigGateway(
  runtime: RuntimeConfigGateway,
): PackagingConfigGateway {
  return {
    async load() {
      try {
        const payload =
          await runtime.get<PackagingSizesPayload>(PACKAGING_SIZES_KEY);
        if (!payload?.sizes) return null;
        return payload.sizes.map((size) =>
          typeof size === "string" ? { name: size, price: 0 } : size,
        );
      } catch (error) {
        console.error("Error obteniendo configuración de empaques:", error);
        return null;
      }
    },

    save: (sizes) => runtime.save(PACKAGING_SIZES_KEY, { sizes }),
  };
}

export const packagingConfigGateway =
  createPackagingConfigGateway(runtimeConfigGateway);
