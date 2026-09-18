import { runtimeConfigGateway } from "../../../shared/api";
import {
  normalizeKitchenModifiersConfig,
  type KitchenModifiersConfig,
} from "../model/kitchenModifiers.types";

const CONFIG_KEY = "kitchen_modifiers";

export const kitchenModifiersGateway = {
  async load() {
    const saved =
      await runtimeConfigGateway.get<Partial<KitchenModifiersConfig>>(
        CONFIG_KEY,
      );
    return normalizeKitchenModifiersConfig(saved);
  },
  save(config: KitchenModifiersConfig) {
    return runtimeConfigGateway.save(
      CONFIG_KEY,
      normalizeKitchenModifiersConfig(config),
    );
  },
};
