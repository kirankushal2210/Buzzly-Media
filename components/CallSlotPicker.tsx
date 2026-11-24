"use client";

import { useState } from "react";
import { Badge, Button, SurfaceCard } from "@/components/ui/core";
import { CALL_MINUTES, IST_SLOT_TIMES, describeSlot, formatSlotTime, nextBusinessDaysIST } from "@/lib/booking";

type Booking = { day: string; time: string };

/**
 * Booking UI: the next 5 business days and IST time slots for a 20-minute call.
 * Pure front end for now — the chosen slot lives in React state only.
 * TODO: Swap with live Cal.com embed in backend phase
 */
export function CallSlotPicker({ lead }: { lead: { fullName: string; email: string } }) {
  const [days] = useState(() => nextBusinessDaysIST(5));
  const [day, setDay] = useState(days[0].iso);
  const [time, setTime] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  if (booking) {
    return (
      <SurfaceCard className="slot-receipt" role="status">
        <Badge tone="accent">Slot selected</Badge>
        <p className="slot-receipt-when">{describeSlot(booking.day, booking.time)}</p>
        <dl>
          <div><dt>Call</dt><dd>{CALL_MINUTES}-minute intro call</dd></div>
          <div><dt>With</dt><dd>{lead.fullName}</dd></div>
          <div><dt>Confirmation to</dt><dd>{lead.email}</dd></div>
        </dl>
        <Button variant="ghost" size="sm" onClick={() => { setBooking(null); setTime(null); }}>Choose a different time</Button>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="slot-picker" aria-label="Pick a time for your strategy call">
      <fieldset className="slot-group">
        <legend className="bz-mono">1 · Pick a day</legend>
        <div className="bz-chips">
          {days.map(option => (
            <label className="bz-chip" key={option.iso}>
              <input type="radio" name="slot-day" value={option.iso} checked={day === option.iso} onChange={() => { setDay(option.iso); setTime(null); }} />
              <span><small>{option.weekday}</small>{option.day} {option.month}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="slot-group">
        <legend className="bz-mono">2 · Pick a time (IST, {CALL_MINUTES} min)</legend>
        <div className="bz-chips">
          {IST_SLOT_TIMES.map(option => (
            <label className="bz-chip" key={option}>
              <input type="radio" name="slot-time" value={option} checked={time === option} onChange={() => setTime(option)} />
              <span>{formatSlotTime(option)} IST</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="slot-actions">
        <Button onClick={() => time && setBooking({ day, time })} disabled={!time} aria-disabled={!time}>
          {time ? `Confirm ${formatSlotTime(time)} IST →` : "Pick a time to continue"}
        </Button>
      </div>
    </SurfaceCard>
  );
}
