import { Types } from "mongoose";


export interface DashboardResponse {
  stats: {
    title: string;
    value: string;
    change: string;
    icon: 'dollar-sign' | 'shopping-cart' | 'package' | 'message-square';
  }[];
  recentOrders: {
    id: string;
    customer: string;
    amount: string;
    status: string;
    date: string;
  }[];
  alerts: {
    type: string;
    message: string;
    details: string;
  }[];
  performanceData: {
    day: string;
    sales: number;
    orders: number;
  }[];
}

