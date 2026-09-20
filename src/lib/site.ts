/**
 * ============================================================
 *  LAXMI DRIVING TRAINING — EDIT ALL BUSINESS DETAILS HERE
 * ------------------------------------------------------------
 *  Every value below marked "[EDIT]" is a placeholder.
 *  Replace with your real details. Nothing else needs changing.
 * ============================================================
 */

export const site = {
  name: "Laxmi Driving Training",
  wordmark: "LAXMI DRIVING TRAINING",
  domain: "LAXMIDRIVING.COM",
  tagline: "Learn Car, Bike & Scooter Driving the Safe Way",

  /** Phone number for click-to-call links */
  phoneDisplay: "+91 70088 91923", // shown on the website
  phoneLink: "+917008891923", // used for tel: links

  /** WhatsApp number, digits only with country code */
  whatsappNumber: "917008891923",
  whatsappMessage: "Hello Laxmi Driving Training, I would like to book a driving lesson.",

  /** [EDIT] Email address */
  email: "info@laxmidriving.com",

  /** Head office address (also used in structured data) */
  address: {
    line1: "Plot No.-101, Palaspur (In Front of Budheshwar Temple)",
    line2: "Main Road, PS.-Pattapur",
    city: "Distt.-Ganjam",
    state: "Odisha",
    pincode: "761013",
  },

  /** All office locations shown on the Contact page and footer */
  offices: [
    {
      label: "Head Office",
      line1: "Plot No.-101, Palaspur (In Front of Budheshwar Temple)",
      line2: "Main Road, PS.-Pattapur",
      city: "Distt.-Ganjam",
      state: "Odisha",
      pincode: "761013",
    },
    {
      label: "Branch Office",
      line1: "Plot No.-107, Raniguda Farm (Near DFO Office)",
      line2: "PO.-Rayagada, Distt.-Rayagada",
      city: "Rayagada",
      state: "Odisha",
      pincode: "765001",
    },
  ],

  /** Opening hours */
  hours: [
    { days: "Monday – Sunday", time: "7:00 AM – 7:00 PM" },
  ],

  /**
   * [EDIT] Google Maps embed URL.
   * Google Maps → search your address → Share → Embed a map → copy the src="..." link
   * and paste it below. Leave empty to show the placeholder box.
   */
  mapEmbedUrl: "",

  /** [EDIT] Social profile links. Leave "" to hide a link. */
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
  },
} as const;

export const whatsappHref = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
  site.whatsappMessage,
)}`;
export const telHref = `tel:${site.phoneLink}`;

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/car-training", label: "Car Training" },
  { to: "/bike-training", label: "Bike Training" },
  { to: "/courses", label: "Courses & Pricing" },
  { to: "/instructors", label: "Instructors" },
  { to: "/safety-rules", label: "Safety Rules" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact Us" },
] as const;

/**
 * [EDIT] COURSES & PRICING
 * `price` and `duration` are plain text — change them freely.
 */
export type Course = {
  id: string;
  vehicle: "Car" | "Motorcycle" | "Scooter";
  level: "Beginner" | "Advanced";
  title: string;
  price: string;
  duration: string;
  summary: string;
  features: string[];
  popular?: boolean;
};

export const courses: Course[] = [
  {
    id: "car-beginner",
    vehicle: "Car",
    level: "Beginner",
    title: "Car Training — Beginner",
    price: "₹4,000 – ₹6,000",
    duration: "[EDIT] 21 days • 21 classes",
    summary:
      "For people who have never held a steering wheel. We start slow and build your confidence step by step.",
    features: [
      "Clutch, brake and gear basics",
      "Steering control and smooth turning",
      "Parking and reverse practice",
      "Traffic signs and road rules class",
      "Dual-control training car",
    ],
    popular: true,
  },
  {
    id: "car-advanced",
    vehicle: "Car",
    level: "Advanced",
    title: "Car Training — Advanced",
    price: "₹3,000 – ₹4,500",
    duration: "[EDIT] 12 days • 12 classes",
    summary:
      "For people who can drive a little but feel nervous in traffic, on highways or while parking.",
    features: [
      "Busy city traffic practice",
      "Highway driving and lane discipline",
      "Parallel and tight-space parking",
      "Night driving and rain driving",
      "Defensive driving habits",
    ],
  },
  {
    id: "bike-beginner",
    vehicle: "Motorcycle",
    level: "Beginner",
    title: "Motorcycle Training — Beginner",
    price: "₹1,500 – ₹3,000",
    duration: "[EDIT] 10 days • 10 classes",
    summary: "Learn to balance, start, ride and stop a geared motorcycle safely from day one.",
    features: [
      "Balance and slow-speed control",
      "Clutch and gear shifting",
      "Safe braking practice",
      "Helmet and safety gear guidance",
      "Cone and figure-8 practice",
    ],
  },
  {
    id: "bike-advanced",
    vehicle: "Motorcycle",
    level: "Advanced",
    title: "Motorcycle Training — Advanced",
    price: "₹1,500 – ₹2,000",
    duration: "[EDIT] 7 days • 7 classes",
    summary: "Sharpen your road sense, cornering and emergency braking for confident daily riding.",
    features: [
      "Emergency braking technique",
      "Cornering and body position",
      "Riding in heavy traffic",
      "Pillion and load handling",
      "Long-ride safety tips",
    ],
  },
  {
    id: "scooter-beginner",
    vehicle: "Scooter",
    level: "Beginner",
    title: "Scooter Training — Beginner",
    price: "₹1,500 – ₹2,000",
    duration: "[EDIT] 7 days • 7 classes",
    summary:
      "Easy, patient scooter training — a favourite choice for students, homemakers and first-time riders.",
    features: [
      "Simple start, ride and stop practice",
      "Balance at low speed",
      "U-turns and narrow lanes",
      "Safe distance and mirror use",
      "Lady instructor available on request",
    ],
    popular: true,
  },
  {
    id: "scooter-advanced",
    vehicle: "Scooter",
    level: "Advanced",
    title: "Scooter Training — Advanced",
    price: "₹1,000 – ₹1,800",
    duration: "[EDIT] 5 days • 5 classes",
    summary: "Ride comfortably on main roads with better control, awareness and confidence.",
    features: [
      "Main road and flyover riding",
      "Traffic signal discipline",
      "Riding with a pillion",
      "Monsoon riding care",
      "Basic scooter maintenance",
    ],
  },
];

/** [EDIT] INSTRUCTOR PROFILES — replace placeholders with real people */
export const instructors = [
  {
    id: 1,
    name: "[EDIT] Instructor Name",
    role: "Senior Car Instructor",
    experience: "[EDIT] years of experience",
    languages: "[EDIT] Hindi, English",
    specialities: ["Beginner car training", "Nervous learners", "Parking practice"],
    initials: "LD",
  },
  {
    id: 2,
    name: "[EDIT] Instructor Name",
    role: "Motorcycle Instructor",
    experience: "[EDIT] years of experience",
    languages: "[EDIT] Hindi, Punjabi",
    specialities: ["Geared bike control", "Cone practice", "Road safety"],
    initials: "LD",
  },
  {
    id: 3,
    name: "[EDIT] Instructor Name",
    role: "Scooter Instructor (Lady)",
    experience: "[EDIT] years of experience",
    languages: "[EDIT] Hindi, English",
    specialities: ["First-time riders", "Ladies batches", "Slow-speed balance"],
    initials: "LD",
  },
  {
    id: 4,
    name: "[EDIT] Instructor Name",
    role: "Advanced Driving Trainer",
    experience: "[EDIT] years of experience",
    languages: "[EDIT] Hindi, English",
    specialities: ["Highway driving", "Defensive driving", "Night driving"],
    initials: "LD",
  },
];

/** [EDIT] TESTIMONIALS — add real reviews from your students */
export const testimonials = [
  {
    id: 1,
    name: "[EDIT] Student Name",
    course: "Car Training — Beginner",
    rating: 5,
    quote:
      "[EDIT] Paste a real review from your student here. Keep it short and in simple words.",
  },
  {
    id: 2,
    name: "[EDIT] Student Name",
    course: "Scooter Training — Beginner",
    rating: 5,
    quote: "[EDIT] Paste a real review from your student here.",
  },
  {
    id: 3,
    name: "[EDIT] Student Name",
    course: "Motorcycle Training — Advanced",
    rating: 5,
    quote: "[EDIT] Paste a real review from your student here.",
  },
  {
    id: 4,
    name: "[EDIT] Student Name",
    course: "Car Training — Advanced",
    rating: 5,
    quote: "[EDIT] Paste a real review from your student here.",
  },
];

export const safetyRules = [
  {
    title: "Always wear your seat belt and helmet",
    body: "Seat belt in the car, ISI-marked helmet on the bike or scooter — every single time, even for a short ride.",
  },
  {
    title: "Never drink and drive",
    body: "Alcohol slows your reaction. If you have taken a drink, do not touch the steering or handlebar.",
  },
  {
    title: "Keep your phone away while driving",
    body: "No calls, no messages, no maps in your hand. Stop safely on the side if you must use the phone.",
  },
  {
    title: "Follow speed limits and signals",
    body: "Slow down near schools, markets and turns. A red light is a full stop, not a suggestion.",
  },
  {
    title: "Use indicators before every turn",
    body: "Tell other road users what you plan to do. Check your mirrors, then indicate, then turn.",
  },
  {
    title: "Keep a safe distance",
    body: "Leave enough gap in front of you so that you can brake calmly if the vehicle ahead stops suddenly.",
  },
  {
    title: "Carry valid documents",
    body: "Driving licence, registration certificate, insurance and PUC — keep them ready, digital copies are fine.",
  },
  {
    title: "Check your vehicle before you start",
    body: "Tyres, brakes, lights, mirrors and fuel. A two-minute check prevents most roadside trouble.",
  },
];

export const faqs = [
  {
    q: "How many days does it take to learn car driving?",
    a: "Most beginners feel confident in about 3 weeks of daily classes. The exact number of classes for each course is listed on the Courses & Pricing page.",
  },
  {
    q: "Do you provide the training car and bike?",
    a: "Yes. All practice is done on our own training vehicles. Our car has dual controls, so the instructor can brake if needed.",
  },
  {
    q: "I am very nervous. Can I still learn?",
    a: "Yes. Most of our students start with zero experience and some fear. We move slowly, explain in simple words and never rush you.",
  },
  {
    q: "Do you help with the driving licence process?",
    a: "Yes, we guide you through the learner's licence and permanent licence steps and explain the documents you need. Government fees are paid by you directly.",
  },
  {
    q: "Is a lady instructor available?",
    a: "A lady instructor can be arranged on request for scooter and car training. Please mention it while booking.",
  },
  {
    q: "Do you pick up from home?",
    a: "Pick-up and drop is available in selected areas. Please call us to confirm whether your area is covered. [EDIT: update this answer with your service areas]",
  },
  {
    q: "What are the timings?",
    a: `Our timings are ${site.hours[0].days}: ${site.hours[0].time}. Early morning and evening batches are the most popular, so book early.`,
  },
  {
    q: "How do I pay the fees?",
    a: "You can pay by cash, UPI or bank transfer at our office. Fees for each course are shown on the Courses & Pricing page.",
  },
];

export const trustStats = [
  { value: "10,000+", label: "Students trained" },
  { value: "7+", label: "Years of teaching" },
  { value: "Dual", label: "Control training car" },
  { value: "7 Days", label: "Batch options a week" },
];
