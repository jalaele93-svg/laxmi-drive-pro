/**
 * ============================================================
 *  VEHICLE PARTNER PROGRAM — EDIT PARTNER DETAILS HERE
 * ------------------------------------------------------------
 *  Values marked "[EDIT]" are placeholders. Replace them with
 *  your real payment details before going live.
 * ============================================================
 */

export const DEPOSIT_AMOUNT = 2000;

/** [EDIT] Where partners send the ₹2,000 advance. */
export const partnerPayment = {
  upiId: "[EDIT: your-upi-id@bank]",
  upiName: "Laxmi Driving Training",
  bankAccountName: "[EDIT: account holder name]",
  bankName: "[EDIT: bank name]",
  accountNumber: "[EDIT: account number]",
  ifsc: "[EDIT: IFSC code]",
};

export const partnerAreas = ["Berhampur, Odisha", "Rayagada, Odisha"];

export const vehicleTypes = ["Car", "Motorcycle", "Scooter"] as const;
export type PartnerVehicleType = (typeof vehicleTypes)[number];

export const ownershipOptions = [
  "Individual Owner",
  "Business Owner",
  "Company/Fleet Owner",
] as const;

export const fuelOptions = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
export const transmissionOptions = ["Manual", "Automatic", "Gearless (Scooter)"];
export const preferredLocations = ["Berhampur", "Rayagada", "Other"];
export const preferredUses = [
  "Driving Training",
  "Beginner Training",
  "Advanced Training",
  "Practical Road Training",
];
export const availabilityOptions = ["Full Day", "Morning", "Afternoon", "Evening", "Flexible"];

export const documentTypes = [
  { id: "rc", label: "Registration Certificate (RC)", required: true },
  { id: "insurance", label: "Insurance Certificate", required: true },
  { id: "puc", label: "PUC Certificate", required: true },
  { id: "licence", label: "Driving Licence of Vehicle Owner", required: true },
  { id: "photo_front", label: "Vehicle Photograph — Front", required: true },
  { id: "photo_rear", label: "Vehicle Photograph — Rear", required: true },
  { id: "photo_side", label: "Vehicle Photograph — Side", required: false },
  { id: "photo_interior", label: "Vehicle Interior Photograph", required: false },
];

export const ACCEPTED_FILE_TYPES = "image/jpeg,image/jpg,image/png,application/pdf";
export const MAX_FILE_MB = 10;

export const partnerBenefits = [
  "Earn from your vehicle",
  "Flexible availability",
  "Local training opportunities",
  "Digital application process",
  "Transparent records",
  "Partner dashboard",
  "Training assignment tracking",
  "Payment history",
  "Dedicated partner support",
];

export const partnerEligibility = [
  "Valid vehicle registration",
  "Valid insurance",
  "Valid PUC where applicable",
  "Vehicle must meet applicable legal requirements",
  "Vehicle should be in safe working condition",
  "Valid vehicle documents",
  "Vehicle inspection may be required",
  "Partner must provide accurate information",
  "Final approval is subject to verification",
];

export const partnerProcess = [
  { step: 1, title: "Apply Online", body: "Fill the partner form with your details and vehicle details." },
  { step: 2, title: "Pay ₹2,000 Advance", body: "Pay the enrollment advance by UPI or bank transfer and share the reference." },
  { step: 3, title: "Submit Documents", body: "Upload RC, insurance, PUC, licence and vehicle photographs." },
  { step: 4, title: "Vehicle Verification", body: "Our team checks your documents and may inspect the vehicle." },
  { step: 5, title: "Application Approval", body: "If everything is in order, your application is approved." },
  { step: 6, title: "Start Partner Activities", body: "Your vehicle can be used for approved training activities." },
];

type PartnerCard = {
  type: PartnerVehicleType;
  emoji: string;
  title: string;
  intro: string;
  cta: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  requirements: string[];
};

export const partnerCards: PartnerCard[] = [
  {
    type: "Car",
    emoji: "🚗",
    title: "Car Partner",
    intro: "Enroll your eligible car with Laxmi Driving Training.",
    cta: "Enroll Car",
    eligibility: [
      "Hatchback, sedan or compact SUV",
      "Registered in your name or your business name",
      "Manual or automatic transmission",
    ],
    benefits: [
      "Used for beginner and advanced car training",
      "Choose your available hours",
      "Records of every assignment",
    ],
    documents: ["RC", "Insurance", "PUC", "Owner's driving licence", "Vehicle photographs"],
    requirements: [
      "Safe working brakes, tyres and lights",
      "Clean and roadworthy condition",
      "Vehicle inspection may be required",
    ],
  },
  {
    type: "Motorcycle",
    emoji: "🏍️",
    title: "Motorcycle Partner",
    intro: "Partner your motorcycle for approved training activities.",
    cta: "Enroll Motorcycle",
    eligibility: [
      "Geared motorcycle in running condition",
      "Registered in your name or your business name",
      "Suitable for learner practice",
    ],
    benefits: [
      "Used for geared bike training batches",
      "Morning, evening or flexible slots",
      "Assignment and payment history",
    ],
    documents: ["RC", "Insurance", "PUC", "Owner's driving licence", "Vehicle photographs"],
    requirements: [
      "Working brakes, horn, lights and mirrors",
      "Good tyre condition",
      "Vehicle inspection may be required",
    ],
  },
  {
    type: "Scooter",
    emoji: "🛵",
    title: "Scooter Partner",
    intro: "Partner your scooter for approved training activities.",
    cta: "Enroll Scooter",
    eligibility: [
      "Gearless scooter in running condition",
      "Registered in your name or your business name",
      "Comfortable for first-time riders",
    ],
    benefits: [
      "High demand from beginner riders",
      "Flexible daily availability",
      "Clear records in your dashboard",
    ],
    documents: ["RC", "Insurance", "PUC", "Owner's driving licence", "Vehicle photographs"],
    requirements: [
      "Working brakes, lights and self-start",
      "Good tyre condition",
      "Vehicle inspection may be required",
    ],
  },
];

export const applicationStatuses = [
  "Draft",
  "Submitted",
  "Payment Pending",
  "Payment Received",
  "Document Verification",
  "Under Review",
  "Approved",
  "Rejected",
  "Correction Required",
  "Active",
  "Suspended",
] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];

export const paymentStatuses = [
  "Pending",
  "Paid",
  "Under Verification",
  "Verified",
  "Refunded",
] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export function statusTone(status: string): string {
  switch (status) {
    case "Approved":
    case "Active":
    case "Verified":
      return "bg-success/12 text-success";
    case "Rejected":
    case "Suspended":
      return "bg-destructive/12 text-destructive";
    case "Correction Required":
    case "Payment Pending":
    case "Pending":
      return "bg-accent/15 text-accent";
    default:
      return "bg-primary/10 text-primary";
  }
}
