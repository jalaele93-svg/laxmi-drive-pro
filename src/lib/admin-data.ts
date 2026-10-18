/**
 * Demo data for the Laxmi Driving Training admin dashboard.
 * All records are clearly-labelled sample data — replace with real
 * data from Lovable Cloud when the backend is connected.
 */

export type OrderStatus = "New" | "Allocated" | "In Progress" | "Completed" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "Refunded" | "Failed";
export type VehicleType = "Car" | "Bike" | "Scooter";

export interface AdminOrder {
  id: string;
  customer: string;
  phone: string;
  vehicle: VehicleType;
  course: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  date: string;
  time: string;
  instructor: string | null;
  amount: number;
  payment: PaymentStatus;
  status: OrderStatus;
}

export interface AdminPayment {
  id: string;
  orderId: string;
  customer: string;
  method: "UPI" | "Cash" | "Card" | "Net Banking";
  amount: number;
  fee: number;
  date: string;
  status: PaymentStatus;
}

export interface AdminDriver {
  id: string;
  name: string;
  vehicles: VehicleType[];
  experience: string;
  license: string;
  rating: number;
  todaySlots: number;
  capacity: number;
  status: "Available" | "On Lesson" | "Leave";
  area: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: VehicleType;
  lessonsDone: number;
  lessonsTotal: number;
  joined: string;
  spend: number;
}

export const kpis = [
  {
    label: "Total Bookings",
    value: "1,284",
    delta: "+12.4%",
    trend: "up" as const,
    hint: "vs last month",
  },
  {
    label: "Revenue (Demo)",
    value: "₹9,86,500",
    delta: "+8.1%",
    trend: "up" as const,
    hint: "vs last month",
  },
  {
    label: "Active Learners",
    value: "312",
    delta: "+4.6%",
    trend: "up" as const,
    hint: "currently enrolled",
  },
  {
    label: "Slot Utilisation",
    value: "87%",
    delta: "-2.3%",
    trend: "down" as const,
    hint: "instructor capacity",
  },
];

export const monthlyBookings = [
  { month: "Feb", car: 68, bike: 41, scooter: 26 },
  { month: "Mar", car: 74, bike: 47, scooter: 30 },
  { month: "Apr", car: 82, bike: 52, scooter: 28 },
  { month: "May", car: 91, bike: 58, scooter: 34 },
  { month: "Jun", car: 86, bike: 61, scooter: 39 },
  { month: "Jul", car: 97, bike: 66, scooter: 42 },
  { month: "Aug", car: 104, bike: 71, scooter: 45 },
];

export const orders: AdminOrder[] = [
  {
    id: "LDT-2481",
    customer: "Learner A (demo)",
    phone: "+91 9XXXX XXX01",
    vehicle: "Car",
    course: "Beginner Car Course",
    level: "Beginner",
    date: "2026-08-26",
    time: "07:00 AM",
    instructor: "Instructor 1 (demo)",
    amount: 8500,
    payment: "Paid",
    status: "In Progress",
  },
  {
    id: "LDT-2480",
    customer: "Learner B (demo)",
    phone: "+91 9XXXX XXX02",
    vehicle: "Bike",
    course: "Motorcycle Basics",
    level: "Beginner",
    date: "2026-08-26",
    time: "08:30 AM",
    instructor: "Instructor 2 (demo)",
    amount: 5500,
    payment: "Pending",
    status: "Allocated",
  },
  {
    id: "LDT-2479",
    customer: "Learner C (demo)",
    phone: "+91 9XXXX XXX03",
    vehicle: "Scooter",
    course: "Scooter Confidence",
    level: "Beginner",
    date: "2026-08-26",
    time: "10:00 AM",
    instructor: null,
    amount: 4500,
    payment: "Pending",
    status: "New",
  },
  {
    id: "LDT-2478",
    customer: "Learner D (demo)",
    phone: "+91 9XXXX XXX04",
    vehicle: "Car",
    course: "Advanced Car Mastery",
    level: "Advanced",
    date: "2026-08-25",
    time: "04:00 PM",
    instructor: "Instructor 3 (demo)",
    amount: 11500,
    payment: "Paid",
    status: "Completed",
  },
  {
    id: "LDT-2477",
    customer: "Learner E (demo)",
    phone: "+91 9XXXX XXX05",
    vehicle: "Car",
    course: "Highway & Night Driving",
    level: "Intermediate",
    date: "2026-08-25",
    time: "07:30 PM",
    instructor: "Instructor 1 (demo)",
    amount: 9500,
    payment: "Paid",
    status: "Completed",
  },
  {
    id: "LDT-2476",
    customer: "Learner F (demo)",
    phone: "+91 9XXXX XXX06",
    vehicle: "Bike",
    course: "Advanced Motorcycle Control",
    level: "Advanced",
    date: "2026-08-24",
    time: "06:30 AM",
    instructor: "Instructor 4 (demo)",
    amount: 7500,
    payment: "Refunded",
    status: "Cancelled",
  },
  {
    id: "LDT-2475",
    customer: "Learner G (demo)",
    phone: "+91 9XXXX XXX07",
    vehicle: "Scooter",
    course: "Scooter Confidence",
    level: "Intermediate",
    date: "2026-08-24",
    time: "11:00 AM",
    instructor: "Instructor 2 (demo)",
    amount: 4500,
    payment: "Paid",
    status: "Completed",
  },
  {
    id: "LDT-2474",
    customer: "Learner H (demo)",
    phone: "+91 9XXXX XXX08",
    vehicle: "Car",
    course: "Beginner Car Course",
    level: "Beginner",
    date: "2026-08-23",
    time: "09:00 AM",
    instructor: "Instructor 3 (demo)",
    amount: 8500,
    payment: "Failed",
    status: "New",
  },
];

export const payments: AdminPayment[] = [
  {
    id: "PAY-9912",
    orderId: "LDT-2481",
    customer: "Learner A (demo)",
    method: "UPI",
    amount: 8500,
    fee: 0,
    date: "2026-08-26",
    status: "Paid",
  },
  {
    id: "PAY-9911",
    orderId: "LDT-2478",
    customer: "Learner D (demo)",
    method: "Card",
    amount: 11500,
    fee: 230,
    date: "2026-08-25",
    status: "Paid",
  },
  {
    id: "PAY-9910",
    orderId: "LDT-2477",
    customer: "Learner E (demo)",
    method: "Net Banking",
    amount: 9500,
    fee: 95,
    date: "2026-08-25",
    status: "Paid",
  },
  {
    id: "PAY-9909",
    orderId: "LDT-2480",
    customer: "Learner B (demo)",
    method: "Cash",
    amount: 5500,
    fee: 0,
    date: "2026-08-26",
    status: "Pending",
  },
  {
    id: "PAY-9908",
    orderId: "LDT-2476",
    customer: "Learner F (demo)",
    method: "UPI",
    amount: 7500,
    fee: 0,
    date: "2026-08-24",
    status: "Refunded",
  },
  {
    id: "PAY-9907",
    orderId: "LDT-2475",
    customer: "Learner G (demo)",
    method: "UPI",
    amount: 4500,
    fee: 0,
    date: "2026-08-24",
    status: "Paid",
  },
  {
    id: "PAY-9906",
    orderId: "LDT-2474",
    customer: "Learner H (demo)",
    method: "Card",
    amount: 8500,
    fee: 170,
    date: "2026-08-23",
    status: "Failed",
  },
];

export const drivers: AdminDriver[] = [
  {
    id: "DRV-01",
    name: "Instructor 1 (demo)",
    vehicles: ["Car"],
    experience: "12 years",
    license: "LIC-XXXX-001",
    rating: 4.9,
    todaySlots: 5,
    capacity: 6,
    status: "On Lesson",
    area: "Area 1 (demo)",
  },
  {
    id: "DRV-02",
    name: "Instructor 2 (demo)",
    vehicles: ["Bike", "Scooter"],
    experience: "8 years",
    license: "LIC-XXXX-002",
    rating: 4.8,
    todaySlots: 4,
    capacity: 6,
    status: "Available",
    area: "Area 2 (demo)",
  },
  {
    id: "DRV-03",
    name: "Instructor 3 (demo)",
    vehicles: ["Car", "Scooter"],
    experience: "10 years",
    license: "LIC-XXXX-003",
    rating: 4.7,
    todaySlots: 6,
    capacity: 6,
    status: "On Lesson",
    area: "Area 1 (demo)",
  },
  {
    id: "DRV-04",
    name: "Instructor 4 (demo)",
    vehicles: ["Bike"],
    experience: "6 years",
    license: "LIC-XXXX-004",
    rating: 4.6,
    todaySlots: 2,
    capacity: 5,
    status: "Available",
    area: "Area 3 (demo)",
  },
  {
    id: "DRV-05",
    name: "Instructor 5 (demo)",
    vehicles: ["Car"],
    experience: "15 years",
    license: "LIC-XXXX-005",
    rating: 5.0,
    todaySlots: 0,
    capacity: 6,
    status: "Leave",
    area: "Area 2 (demo)",
  },
];

export const customers: AdminCustomer[] = [
  {
    id: "CUS-501",
    name: "Learner A (demo)",
    phone: "+91 9XXXX XXX01",
    email: "learner.a@example.com",
    vehicle: "Car",
    lessonsDone: 6,
    lessonsTotal: 15,
    joined: "2026-07-02",
    spend: 8500,
  },
  {
    id: "CUS-502",
    name: "Learner B (demo)",
    phone: "+91 9XXXX XXX02",
    email: "learner.b@example.com",
    vehicle: "Bike",
    lessonsDone: 2,
    lessonsTotal: 10,
    joined: "2026-07-18",
    spend: 5500,
  },
  {
    id: "CUS-503",
    name: "Learner C (demo)",
    phone: "+91 9XXXX XXX03",
    email: "learner.c@example.com",
    vehicle: "Scooter",
    lessonsDone: 0,
    lessonsTotal: 8,
    joined: "2026-08-20",
    spend: 4500,
  },
  {
    id: "CUS-504",
    name: "Learner D (demo)",
    phone: "+91 9XXXX XXX04",
    email: "learner.d@example.com",
    vehicle: "Car",
    lessonsDone: 20,
    lessonsTotal: 20,
    joined: "2026-05-11",
    spend: 20000,
  },
  {
    id: "CUS-505",
    name: "Learner E (demo)",
    phone: "+91 9XXXX XXX05",
    email: "learner.e@example.com",
    vehicle: "Car",
    lessonsDone: 12,
    lessonsTotal: 12,
    joined: "2026-06-04",
    spend: 9500,
  },
  {
    id: "CUS-506",
    name: "Learner G (demo)",
    phone: "+91 9XXXX XXX07",
    email: "learner.g@example.com",
    vehicle: "Scooter",
    lessonsDone: 8,
    lessonsTotal: 8,
    joined: "2026-06-22",
    spend: 9000,
  },
];

/** Unallocated + allocated slot board for the Allocation screen. */
export const allocationSlots = [
  {
    time: "07:00 AM",
    order: "LDT-2481",
    customer: "Learner A (demo)",
    vehicle: "Car" as VehicleType,
    driver: "Instructor 1 (demo)",
  },
  {
    time: "08:30 AM",
    order: "LDT-2480",
    customer: "Learner B (demo)",
    vehicle: "Bike" as VehicleType,
    driver: "Instructor 2 (demo)",
  },
  {
    time: "10:00 AM",
    order: "LDT-2479",
    customer: "Learner C (demo)",
    vehicle: "Scooter" as VehicleType,
    driver: null,
  },
  {
    time: "12:00 PM",
    order: "LDT-2474",
    customer: "Learner H (demo)",
    vehicle: "Car" as VehicleType,
    driver: null,
  },
  {
    time: "04:00 PM",
    order: "LDT-2482",
    customer: "Learner I (demo)",
    vehicle: "Car" as VehicleType,
    driver: "Instructor 3 (demo)",
  },
  {
    time: "06:30 PM",
    order: "LDT-2483",
    customer: "Learner J (demo)",
    vehicle: "Bike" as VehicleType,
    driver: null,
  },
];

export const reportRows = [
  { label: "Beginner Car Course", bookings: 412, revenue: 350200, share: 36 },
  { label: "Advanced Car Mastery", bookings: 168, revenue: 193200, share: 20 },
  { label: "Motorcycle Basics", bookings: 286, revenue: 157300, share: 16 },
  { label: "Advanced Motorcycle Control", bookings: 94, revenue: 70500, share: 7 },
  { label: "Scooter Confidence", bookings: 224, revenue: 100800, share: 11 },
  { label: "Highway & Night Driving", bookings: 100, revenue: 95000, share: 10 },
];

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
