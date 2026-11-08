/* eslint-disable @next/next/no-html-link-for-pages -- The deployed vinext Link handler throws on navigation; native anchors keep these routes usable. */
"use client";

import { useEffect, useState } from "react";

export function InteriorHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);
  return (
    <header className="wrap interior-site-header">
      <nav className={`leftnav${menuOpen ? " is-open" : ""}`} aria-label="Primary" id="interior-nav" onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
      }}>
        <a className="navlink" href="/work">Work</a>
        <a className="navlink" href="/about">About</a>
        <a className="navlink" href="/services">Services <span className="navcaret">⌄</span></a>
        <a className="navlink" href="/companies">Our companies</a>
        <a className="navlink" href="/clients">Clients</a>
      </nav>
      <a className="logo" href="/"><span className="brandburst" aria-hidden="true">✳ ✳ ✳</span><span className="brandname">Buzzly<span>.</span></span></a>
      <div className="rightnav">
        <a className="topcontact" href="/contact">Let’s Connect ↗</a>
        <button className="menu" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-controls="interior-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "×" : "☰"}</button>
      </div>
    </header>
  );
}
