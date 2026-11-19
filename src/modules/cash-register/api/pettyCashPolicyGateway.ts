import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "../../../shared/api";
import {
  DEFAULT_PETTY_CASH_POLICY,
  type PettyCashPolicy,
} from "../model/cash-expense.types";

const PETTY_CASH_POLICY_KEY = "petty_cash_policy";

export interface PettyCashPolicyGateway {
  load(): Promise<PettyCashPolicy | null>;
  save(policy: PettyCashPolicy): Promise<void>;
}

export function createPettyCashPolicyGateway(
  runtime: RuntimeConfigGateway,
): PettyCashPolicyGateway {
  return {
    async load(): Promise<PettyCashPolicy | null> {
        const data = await runtime.get<PettyCashPolicy>(PETTY_CASH_POLICY_KEY);
        if (!data || Object.keys(data).length === 0) {
          return null;
        }

        // Merge saved data with defaults to ensure all categories and fields exist
        return {
          ...DEFAULT_PETTY_CASH_POLICY,
          ...data,
          categoryPolicies: {
            ...DEFAULT_PETTY_CASH_POLICY.categoryPolicies,
            ...(data.categoryPolicies || {}),
          },
        };
    },

    async save(policy: PettyCashPolicy): Promise<void> {
      await runtime.save(PETTY_CASH_POLICY_KEY, policy);
    },
  };
}

export const pettyCashPolicyGateway =
  createPettyCashPolicyGateway(runtimeConfigGateway);
