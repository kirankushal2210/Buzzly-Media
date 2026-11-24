"use client";

import { useState } from "react";
import { initials, roleGroups, team, type RoleGroupId } from "@/lib/team";

type Face = { key: string; name: string; role: string; group: RoleGroupId; photo?: string; placeholder: boolean };

/**
 * "Behind your brand there are experts": a clickable list of role groups
 * beside portraits on the brand red, scattered over a giant "Our Team".
 * Hovering or focusing a portrait shows name and role; picking a role group
 * spotlights the people in it. With nobody added yet (lib/team.ts), each
 * group shows one "profile coming soon" tile; no names are invented.
 */
export function TeamCrew() {
  const faces: Face[] = team.length
    ? team.map(member => ({ key: member.name, name: member.name, role: member.role, group: member.group, photo: member.photo, placeholder: false }))
    : roleGroups.map(group => ({ key: group.id, name: "Profile coming soon", role: group.title, group: group.id, placeholder: true }));
  const [group, setGroup] = useState<RoleGroupId | null>(null);
  const [face, setFace] = useState<string | null>(null);
  const scattered = faces.length <= 8;

  const isLit = (item: Face) => (face ? item.key === face : group ? item.group === group : false);
  const dimming = Boolean(face || group);

  return (
    <div className="crew" onMouseLeave={() => { setFace(null); setGroup(null); }}>
      <div className="crew-lead">
        <h2 className="crew-title">Behind your brand<br />there are <em>experts</em></h2>
        <ul className="crew-roles" aria-label="Who is on the team">
          {roleGroups.map(item => (
            <li key={item.id}>
              <button
                type="button"
                className={group === item.id ? "is-active" : undefined}
                aria-pressed={group === item.id}
                onClick={() => { setFace(null); setGroup(current => (current === item.id ? null : item.id)); }}
                onMouseEnter={() => { setFace(null); setGroup(item.id); }}
                onFocus={() => { setFace(null); setGroup(item.id); }}
              >
                <span className="crew-role-title">{item.title}</span>
                <span className="crew-role-line">{item.line}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={`crew-stage${scattered ? " is-scattered" : ""}`}>
        <p className="crew-word" aria-hidden="true"><span>Our</span><span>Team</span></p>
        <ul className="crew-faces">
          {faces.map(item => (
            <li
              key={item.key}
              className={`crew-face${isLit(item) ? " is-active" : ""}${dimming && !isLit(item) ? " is-dim" : ""}`}
              tabIndex={0}
              aria-label={`${item.name}, ${item.role}`}
              onMouseEnter={() => setFace(item.key)}
              onFocus={() => setFace(item.key)}
            >
              {item.photo
                // eslint-disable-next-line @next/next/no-img-element -- static cut-out headshot from /public
                ? <img src={item.photo} alt="" loading="lazy" />
                : <span className="crew-face-mark" aria-hidden="true">{item.placeholder ? "B" : initials(item.name)}</span>}
              <span className="crew-face-caption" aria-hidden="true">
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
