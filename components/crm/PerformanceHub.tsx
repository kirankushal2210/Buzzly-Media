"use client";

import { useEffect, useState } from "react";
import { AD_CHANNELS, type CrmRecord } from "@/lib/crm-config";
import { campaignAlert } from "@/lib/crm-metrics";
import { RecordManager } from "@/components/crm/RecordManager";
import { money, number } from "@/components/crm/format";

/**
 * Performance marketing by channel: paid search, paid social, tracked
 * influencers, lead generation, marketplace ads and email. Each channel shows
 * its totals from logged campaigns; picking one narrows the campaign list to it
 * and pre-fills new campaigns with the channel.
 */
const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

function totals(list: CrmRecord[]) {
  const spend = list.reduce((s, c) => s + num(c.data.spend), 0);
  const leads = list.reduce((s, c) => s + num(c.data.leads), 0);
  const revenue = list.reduce((s, c) => s + num(c.data.revenue), 0);
  return {
    live: list.filter(c => c.data.status === "Live").length,
    spend, leads,
    cpl: leads ? spend / leads : null,
    roas: spend && revenue ? revenue / spend : null, // no revenue logged yet: show "—", not 0×
    alerts: list.filter(c => c.data.status === "Live" && campaignAlert(c.data) === "Above target").length,
  };
}

export function PerformanceHub() {
  const [campaigns, setCampaigns] = useState<CrmRecord[] | null>(null);
  const [channel, setChannel] = useState<string>("");

  useEffect(() => {
    fetch("/api/crm/campaigns").then(r => r.json() as Promise<{ records?: CrmRecord[] }>)
      .then(b => setCampaigns(b.records ?? [])).catch(() => setCampaigns([]));
    const c = new URL(window.location.href).searchParams.get("channel");
    if (c && AD_CHANNELS.some(x => x.name === c)) setChannel(c); // eslint-disable-line react-hooks/set-state-in-effect -- one-off, from the URL
  }, []);

  const pick = (name: string) => {
    setChannel(name);
    const url = new URL(window.location.href);
    if (name) url.searchParams.set("channel", name); else url.searchParams.delete("channel");
    window.history.replaceState(null, "", url.pathname + url.search);
  };
  const all = totals(campaigns ?? []);

  return (
    <div className="pm">
      <div className="pm-summary" aria-label="All channels">
        <span><b>{number(all.live)}</b> live campaigns</span>
        <span><b>{money(all.spend)}</b> spent</span>
        <span><b>{number(all.leads)}</b> leads</span>
        <span><b>{all.cpl === null ? "—" : money(Math.round(all.cpl))}</b> cost per lead</span>
        <span><b>{all.roas === null ? "—" : `${all.roas.toFixed(2)}×`}</b> ROAS</span>
      </div>

      <div className="pm-channels">
        {AD_CHANNELS.map(c => {
          const t = totals((campaigns ?? []).filter(x => x.data.channel === c.name));
          return (
            <button key={c.name} type="button" className="pm-channel" aria-pressed={channel === c.name} onClick={() => pick(channel === c.name ? "" : c.name)}>
              <span className="pm-channel-head"><strong>{c.name}</strong>{t.alerts > 0 && <em>{t.alerts} over target</em>}</span>
              <span className="pm-channel-sub">{c.short}: {c.types.join(", ")}</span>
              <span className="pm-channel-platforms">{c.platforms.join(", ")}</span>
              <span className="pm-channel-stats">
                <span><b>{number(t.live)}</b> live</span>
                <span><b>{money(t.spend)}</b> spend</span>
                <span><b>{number(t.leads)}</b> leads</span>
                <span><b>{t.cpl === null ? "—" : money(Math.round(t.cpl))}</b> CPL</span>
              </span>
            </button>
          );
        })}
      </div>

      <RecordManager key={channel || "all"} entityKey="campaigns"
        where={channel ? { channel } : undefined}
        title={channel ? `${channel} campaigns` : "All campaigns"} />
      {channel === "Influencer (tracked)" && (
        <p className="crm-muted pm-note">Track creators by results: give each one a promo code, UTM link or affiliate link, and log the leads and revenue it brings, not just the posting fee.</p>
      )}
      <RecordManager entityKey="creativeTests" />
    </div>
  );
}
