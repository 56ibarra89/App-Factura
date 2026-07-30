export interface DeliveryStat {
  userId: string;
  todayDeliveries: number;
}

export interface DeliveryDriver {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  workDays?: string[];
  extraDays?: Array<{
    date: string;
    notes?: string;
  }>;
}
