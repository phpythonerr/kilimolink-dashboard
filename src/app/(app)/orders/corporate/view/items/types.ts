export interface OrderItem {
  id: string;
  commodity_id: string | null;
  buying_price: number | string;
  selling_price: number | string;
  quantity: number | string;
  uom: string;
  note: string;
  customer: string;
  loading: boolean;
  uom_options?: string[];
}

export interface Product {
  id: string;
  name: string;
  quantity_unit: string;
  quantity_unit_options: string[];
}

export interface Order {
  id: string;
  user: string;
  delivery_date: string;
}

export interface FormProps {
  products: Product[];
  items: OrderItem[];
  order: Order;
}
