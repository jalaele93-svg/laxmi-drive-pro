import { z } from "zod";
import { courses, instructors, testimonials, faqs, safetyRules } from "@/lib/site";

const text = z.string().trim().min(1, "Please complete all required fields.").max(5000);
export const contentSchemas = {
  courses: z.object({
    id: text,
    vehicle: z.enum(["Car", "Motorcycle", "Scooter", "Auto"]),
    level: z.enum(["Beginner", "Advanced"]),
    title: text,
    price: text,
    duration: text,
    summary: text,
    features: z.array(text).min(1),
    popular: z.boolean().default(false),
  }),
  instructors: z.object({
    id: z.union([z.string(), z.number()]),
    name: text,
    role: text,
    experience: text,
    languages: text,
    specialities: z.array(text).min(1),
    initials: text.max(4),
  }),
  testimonials: z.object({
    id: z.union([z.string(), z.number()]),
    name: text,
    course: text,
    rating: z.number().int().min(1).max(5),
    quote: text,
  }),
  faqs: z.object({ q: text, a: text }),
  safetyRules: z.object({ title: text, body: text }),
};
export type ContentSection = keyof typeof contentSchemas;
export type ContentRow = {
  id: string;
  section: string;
  content: unknown;
  visible: boolean;
  sort_order: number;
};
export const defaultContent = { courses, instructors, testimonials, faqs, safetyRules };
export function defaultContentRows(): ContentRow[] {
  return (Object.keys(defaultContent) as ContentSection[]).flatMap((section) =>
    defaultContent[section].map((content, index) => ({
      id: `${section}:${"id" in content ? content.id : index}`,
      section,
      content,
      visible: true,
      sort_order: index,
    })),
  );
}
export function mergeContentRows(overrides: ContentRow[]) {
  const rows = new Map(defaultContentRows().map((row) => [row.id, row]));
  overrides.forEach((row) => rows.set(row.id, row));
  return [...rows.values()].sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
}
export function resolveWebsiteContent(overrides: ContentRow[]) {
  const rows = mergeContentRows(overrides).filter((row) => row.visible);
  function section<K extends ContentSection>(key: K): z.infer<(typeof contentSchemas)[K]>[] {
    return rows
      .filter((row) => row.section === key)
      .flatMap((row) => {
        const parsed = contentSchemas[key].safeParse(row.content);
        return parsed.success ? [parsed.data as z.infer<(typeof contentSchemas)[K]>] : [];
      });
  }
  return {
    courses: section("courses"),
    instructors: section("instructors"),
    testimonials: section("testimonials"),
    faqs: section("faqs"),
    safetyRules: section("safetyRules"),
  };
}
