import type { Metadata } from "next";
import { Interior } from "@/components/Interior";
import { InViewVideo } from "@/components/InViewVideo";

export const metadata: Metadata = { title: "Client Confessions and Wins", description: "Learn how Buzzly approaches content and distribution for ambitious businesses. Client stories will be shared when available." };

export default function Clients() {
  return <Interior eyebrow="BUZZLY / PEOPLE WE BUILD WITH" title="Client Confessions and Wins." intro="The stories behind our partnerships will live here as they become ready to share.">
    <section className="clients-page-process" aria-label="How a partnership takes shape">
      <div className="clients-page-process-heading"><p className="interior-eyebrow">THE WORK BEHIND THE STORY</p><h2>A brief.<br />A story.<br /><em>A way<br />forward.</em></h2><p>We begin with what a business wants people to know, then create content that gives the idea a form and helps it reach an audience.</p></div>
      <div className="clients-page-process-steps"><div><span>01 / LISTEN</span><p>Understand the business, its audience, and the change it wants to make.</p></div><div><span>02 / CREATE</span><p>Shape the strategy, write the story, and make the content.</p></div><div><span>03 / DISTRIBUTE</span><p>Publish, learn from the response, and keep building reach.</p></div></div>
    </section>
    <section className="clients-page-film" aria-label="Illustrative cafe campaign film"><div><p className="interior-eyebrow">BUZZLY / THE CAFE STORY</p><h2>See the idea<br /><em>in motion.</em></h2><p>This fictional cafe story shows how a brief can become a reel and reach an audience. Its view and customer numbers are illustrative, not client results.</p><a href="/services">Explore how we work ↗</a></div><InViewVideo src="/media/buzzly-cafe-story.mp4" poster="/media/buzzly-cafe-story-poster.jpg" controls label="Illustrative Buzzly cafe campaign story film" /></section>
    <section className="clients-page-wins">
      <p className="interior-eyebrow">BUZZLY / CLIENT STORIES</p>
      <h2>You win.<br /><em>We grin.</em></h2>
      <p>We build content and distribution for ambitious businesses and the companies we are building. As partner stories are approved, this is where they will be shared.</p>
      <a href="/contact">Start a Project ↗</a>
    </section>
  </Interior>;
}
