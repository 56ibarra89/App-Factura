import { useCallback } from "react";
import { OrdersPage } from "../../modules/orders";
import { useMesasConfig } from "../../modules/tables";
import { formatTableName } from "../../shared/format";

export default function OrdersRoutePage() {
  const { floorsConfig } = useMesasConfig();
  const resolveTableName = useCallback(
    (tableId: string) => formatTableName(tableId, floorsConfig),
    [floorsConfig],
  );

  return <OrdersPage resolveTableName={resolveTableName} />;
}
