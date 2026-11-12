import { useCallback, useEffect, useState } from "react";
import {
  deviceGateway,
  type Device,
  type DeviceGateway,
} from "../api/deviceGateway";

export function useAdminDevices(gateway: DeviceGateway = deviceGateway) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setDevices(await gateway.list());
    } catch (error) {
      console.error("Error al obtener los periféricos:", error);
    }
  }, [gateway]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const scan = async () => {
    setScanning(true);
    try {
      await gateway.scan();
      await refresh();
    } catch (error) {
      console.error("Error al escanear dispositivos:", error);
    } finally {
      setScanning(false);
    }
  };

  return { devices, scanning, scan, refresh };
}
