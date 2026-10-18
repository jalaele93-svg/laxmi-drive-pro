import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Plus, Save, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  contentSchemas,
  mergeContentRows,
  type ContentRow,
  type ContentSection,
} from "@/lib/website-content";
import { friendlyError } from "@/lib/operations";

const sections = [
  { key: "courses", label: "Courses", path: "/courses" },
  { key: "instructors", label: "Instructors", path: "/instructors" },
  { key: "testimonials", label: "Reviews", path: "/testimonials" },
  { key: "faqs", label: "FAQ", path: "/faq" },
  { key: "safetyRules", label: "Safety rules", path: "/safety-rules" },
] as const;
const fields: Record<
  ContentSection,
  {
    key: string;
    label: string;
    kind?: "long" | "lines" | "number" | "boolean";
    choices?: string[];
  }[]
> = {
  courses: [
    { key: "title", label: "Course name" },
    { key: "vehicle", label: "Vehicle", choices: ["Car", "Motorcycle", "Scooter", "Auto"] },
    { key: "level", label: "Level", choices: ["Beginner", "Advanced"] },
    { key: "price", label: "Price (₹)" },
    { key: "duration", label: "Days and classes" },
    { key: "summary", label: "Course description", kind: "long" },
    { key: "features", label: "What students learn (one per line)", kind: "lines" },
    { key: "popular", label: "Popular course badge", kind: "boolean" },
  ],
  instructors: [
    { key: "name", label: "Instructor name" },
    { key: "role", label: "Teaching role" },
    { key: "experience", label: "Experience" },
    { key: "languages", label: "Languages" },
    { key: "specialities", label: "Specialities (one per line)", kind: "lines" },
    { key: "initials", label: "Profile initials" },
  ],
  testimonials: [
    { key: "name", label: "Student name" },
    { key: "course", label: "Course taken" },
    { key: "rating", label: "Rating (1–5)", kind: "number" },
    { key: "quote", label: "Student review", kind: "long" },
  ],
  faqs: [
    { key: "q", label: "Question" },
    { key: "a", label: "Answer", kind: "long" },
  ],
  safetyRules: [
    { key: "title", label: "Rule title" },
    { key: "body", label: "Explanation", kind: "long" },
  ],
};
type Draft = Record<string, string | number | boolean | string[]>;
export function WebsiteEditor() {
  const qc = useQueryClient();
  const [section, setSection] = useState<ContentSection>("courses");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ContentRow | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [errorText, setErrorText] = useState("");
  const query = useQuery({
    queryKey: ["staff-website-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("website_content").select("*");
      if (error) throw error;
      return data;
    },
  });
  const rows = mergeContentRows(query.data ?? []).filter((row) => row.section === section);
  const save = useMutation({
    mutationFn: async (row: ContentRow) => {
      const content = contentSchemas[section].parse(row.content);
      const { error, data } = await supabase
        .from("website_content")
        .upsert({
          id: row.id,
          section,
          content: content as Json,
          visible: row.visible,
          sort_order: row.sort_order,
        })
        .select("id")
        .single();
      if (error || !data) throw error ?? new Error("This change could not be saved.");
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["staff-website-content"] }),
        qc.invalidateQueries({ queryKey: ["website-content"] }),
      ]);
      setEditing(null);
      setErrorText("");
      toast.success("Website updated");
    },
    onError: (error) => {
      const message = friendlyError(error);
      setErrorText(message);
      toast.error(message);
    },
  });
  function open(row?: ContentRow) {
    const id = crypto.randomUUID();
    const content: Draft = row
      ? { ...(row.content as Draft) }
      : Object.fromEntries(
          fields[section].map((field) => [
            field.key,
            field.choices?.[0] ??
              (field.kind === "number"
                ? 5
                : field.kind === "boolean"
                  ? false
                  : field.kind === "lines"
                    ? []
                    : ""),
          ]),
        );
    if (!row && section !== "faqs" && section !== "safetyRules") content["id"] = id;
    setDraft(content);
    setEditing(
      row ?? {
        id: `${section}:${id}`,
        section,
        content,
        visible: true,
        sort_order: rows.reduce((max, r) => Math.max(max, r.sort_order), -1) + 1,
      },
    );
    setErrorText("");
  }
  const activeSection = sections.find((item) => item.key === section) ?? sections[0];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Edit website</h1>
        <Button asChild variant="outline">
          <Link to={activeSection.path} target="_blank">
            <ExternalLink className="size-4" />
            View page
          </Link>
        </Button>
      </div>
      <Tabs
        value={section}
        onValueChange={(value) => {
          setSection(value as ContentSection);
          setSearch("");
        }}
      >
        <TabsList className="h-auto flex flex-wrap justify-start">
          {sections.map((item) => (
            <TabsTrigger key={item.key} value={item.key}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            aria-label="Search website content"
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${activeSection.label.toLowerCase()}`}
          />
        </label>
        <Button onClick={() => open()} disabled={query.isPending || !!query.error}>
          <Plus className="size-4" />
          Add{" "}
          {section === "courses"
            ? "course"
            : section === "instructors"
              ? "instructor"
              : section === "testimonials"
                ? "review"
                : section === "faqs"
                  ? "question"
                  : "rule"}
        </Button>
      </div>
      {query.isPending ? (
        <p role="status">Loading website content…</p>
      ) : query.error ? (
        <p role="alert" className="text-destructive">
          {friendlyError(query.error)}
        </p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {rows
            .filter((row) =>
              JSON.stringify(row.content).toLowerCase().includes(search.toLowerCase()),
            )
            .map((row) => {
              const content = row.content as Draft;
              return (
                <article
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-5"
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words font-semibold">
                      {String(content["title"] ?? content["name"] ?? content["q"])}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {section === "courses"
                        ? `${content["price"]} · ${content["duration"]}`
                        : section === "instructors"
                          ? `${content["role"]} · ${content["experience"]}`
                          : String(content["a"] ?? content["quote"] ?? content["body"] ?? "").slice(
                              0,
                              150,
                            )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.visible ? "Shown on website" : "Hidden from website"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={save.isPending}
                      onClick={() => open(row)}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title={row.visible ? "Hide from website" : "Show on website"}
                      aria-label={`${row.visible ? "Hide" : "Show"} ${content["title"] ?? content["name"] ?? content["q"]}`}
                      disabled={save.isPending}
                      onClick={() => save.mutate({ ...row, visible: !row.visible })}
                    >
                      {row.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </Button>
                  </div>
                </article>
              );
            })}
          {!rows.length && <p className="py-8 text-muted-foreground">No entries yet.</p>}
        </div>
      )}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !save.isPending) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogTitle>Edit {activeSection.label.toLowerCase()}</DialogTitle>
          <DialogDescription>
            {section === "instructors" ? "Website profile" : activeSection.label}
          </DialogDescription>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!editing) return;
              const parsed = contentSchemas[section].safeParse(draft);
              if (!parsed.success) {
                setErrorText(parsed.error.issues[0]?.message ?? "Check all fields.");
                return;
              }
              save.mutate({ ...editing, content: parsed.data });
            }}
          >
            {fields[section].map((field) =>
              field.kind === "boolean" ? (
                <label key={field.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!draft[field.key]}
                    onChange={(event) => setDraft({ ...draft, [field.key]: event.target.checked })}
                  />
                  {field.label}
                </label>
              ) : (
                <label key={field.key} className="grid gap-1.5 text-sm font-medium">
                  {field.label}
                  {field.choices ? (
                    <select
                      className="h-10 rounded border border-input bg-background px-3"
                      value={String(draft[field.key] ?? "")}
                      onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                    >
                      {field.choices.map((choice) => (
                        <option key={choice}>{choice}</option>
                      ))}
                    </select>
                  ) : field.kind === "long" || field.kind === "lines" ? (
                    <Textarea
                      required
                      rows={4}
                      value={
                        Array.isArray(draft[field.key])
                          ? (draft[field.key] as string[]).join("\n")
                          : String(draft[field.key] ?? "")
                      }
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          [field.key]:
                            field.kind === "lines"
                              ? event.target.value.split("\n")
                              : event.target.value,
                        })
                      }
                    />
                  ) : (
                    <Input
                      required
                      maxLength={field.key === "initials" ? 4 : 200}
                      type={field.kind === "number" ? "number" : "text"}
                      min={1}
                      max={5}
                      value={String(draft[field.key] ?? "")}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          [field.key]:
                            field.kind === "number"
                              ? Number(event.target.value)
                              : event.target.value,
                        })
                      }
                    />
                  )}
                </label>
              ),
            )}
            {errorText && (
              <p role="alert" className="text-sm text-destructive">
                {errorText}
              </p>
            )}
            <Button type="submit" disabled={save.isPending}>
              <Save className="size-4" />
              {save.isPending ? "Saving…" : "Save to website"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
