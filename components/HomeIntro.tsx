/* Homepage links use full navigation until the remaining prototype interactions are React components. */
/* eslint-disable @next/next/no-html-link-for-pages */

export function Splash() {
  return (
    <div className="splash" id="splash" role="status" aria-label="Buzzly introduction">
      <div className="splash-inner">
        <div className="splash-brand">
          <span>Buzzly</span><span className="splash-line" aria-hidden="true" /><span className="dot" aria-hidden="true">●</span>
        </div>
        <h2>We build brands through content.<br /><em>Ours and everyone else’s.</em></h2>
      </div>
      <button className="splash-skip" id="skipSplash" aria-label="Skip introduction">Skip intro ↗</button>
    </div>
  );
}

export function HomeHeader() {
  return (
    <header className="wrap home-site-header">
      <nav className="leftnav" aria-label="Primary" id="home-nav">
        <a className="navlink" href="/work">Work</a>
        <a className="navlink" href="/about">About</a>
        <a className="navlink" href="/services">Services <span className="navcaret">⌄</span></a>
        <a className="navlink" href="/companies">Our companies</a>
        <a className="navlink" href="/clients">Clients</a>
      </nav>
      <a className="logo" href="#top"><span className="brandburst" aria-hidden="true">✳ ✳ ✳</span><span className="brandname">Buzzly<span>.</span></span></a>
      <div className="rightnav">
        <a className="topcontact" href="#contact">Let’s Connect ↗</a>
        <button className="menu" id="menuBtn" aria-label="Open menu" aria-controls="home-nav" aria-expanded="false">☰</button>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="intro wrap">
      <div className="eyebrow">BUZZLY / BUILDING BRANDS THROUGH CONTENT</div>
      <h1><span>We build brands</span><span>through content.</span><em>Ours and everyone else’s.</em></h1>
      <div className="herooffer">
        <p><span aria-hidden="true">〰</span> For ambitious brands ready to scale. <span aria-hidden="true">〰</span></p>
        <a className="cta" href="/contact">Start a Project</a>
      </div>
      <div className="lede">
        <div className="hero-statement">
          <p>A technology-led company builder with content at its core.</p>
          <small>We build our own businesses and help ambitious partners grow through strategy, storytelling, and distribution.</small>
          <a className="outlinecta" href="/work">Our Work</a>
        </div>
        <div className="film-tease"><span>01 / THE CAFE STORY</span><strong>From cafe brief to customers ↓</strong><small>48 seconds · An illustrative cafe campaign</small></div>
      </div>
    </section>
  );
}
