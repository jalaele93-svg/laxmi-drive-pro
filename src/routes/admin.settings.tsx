import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminPageHeader, DemoNote } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/lib/site";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Laxmi Admin" },
      {
        name: "description",
        content: "Institute profile, booking rules and notification preferences for the admin panel.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Settings,
});

const toggles = [
  { id: "sms", label: "SMS booking confirmations", hint: "Send an SMS when a lesson is confirmed." },
  { id: "whatsapp", label: "WhatsApp reminders", hint: "Remind learners 2 hours before a slot." },
  { id: "auto", label: "Auto-allocate instructors", hint: "Match the first free instructor by vehicle." },
  { id: "online", label: "Accept online payments", hint: "Allow UPI and card payment at booking." },
] as const;

function Settings() {
  const [saved, setSaved] = useState(false);
  const [switches, setSwitches] = useState<Record<string, boolean>>({
    sms: true,
    whatsapp: true,
    auto: false,
    online: true,
  });

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Institute profile, booking rules and notification preferences."
        actions={
          <Button
            onClick={() => {
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2500);
            }}
          >
            {saved ? "Saved (demo)" : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="card-surface">
          <CardHeader>
            <CardTitle className="text-base font-bold">Institute profile</CardTitle>
            <CardDescription>Shown on the public website and booking confirmations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Institute name</Label>
              <Input id="name" defaultValue={site.wordmark} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" defaultValue={site.domain} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue={site.phoneDisplay} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={site.email} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                rows={3}
                defaultValue={`${site.address.line1}, ${site.address.line2}, ${site.address.city}, ${site.address.state} ${site.address.pincode}`}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-base font-bold">Booking rules</CardTitle>
              <CardDescription>Controls how slots are opened to learners.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slot">Slot length (minutes)</Label>
                <Input id="slot" type="number" defaultValue={45} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perday">Max lessons per instructor / day</Label>
                <Input id="perday" type="number" defaultValue={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="open">First slot</Label>
                <Input id="open" type="time" defaultValue="06:30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close">Last slot</Label>
                <Input id="close" type="time" defaultValue="19:30" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-surface">
            <CardHeader>
              <CardTitle className="text-base font-bold">Notifications & payments</CardTitle>
              <CardDescription>Turn automated messages and online payment on or off.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {toggles.map((t, i) => (
                <div key={t.id}>
                  {i > 0 ? <Separator className="my-3" /> : null}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Label htmlFor={t.id} className="font-semibold">
                        {t.label}
                      </Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t.hint}</p>
                    </div>
                    <Switch
                      id={t.id}
                      checked={switches[t.id] ?? false}
                      onCheckedChange={(v) => setSwitches((prev) => ({ ...prev, [t.id]: v }))}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <DemoNote>
        Settings are not persisted yet — connect Lovable Cloud to store them for the whole team.
      </DemoNote>
    </>
  );
}
