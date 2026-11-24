import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PLAYBOOK_CATEGORIES, playbookBySlug, playbookWordCount, playbooks } from "../data/insights.ts";
import { TIER_SLUGS } from "../lib/engagements.ts";

/** A comfortable adult reading pace for considered, non-fiction text. */
const WORDS_PER_MINUTE = 200;

describe("playbooks", () => {
  it("have unique, URL-safe slugs that resolve", () => {
    const slugs = playbooks.map(playbook => playbook.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const slug of slugs) {
      assert.match(slug, /^[a-z0-9-]+$/);
      assert.equal(playbookBySlug(slug)?.slug, slug);
    }
  });

  it("use known categories and engagement scopes", () => {
    for (const playbook of playbooks) {
      assert.ok(PLAYBOOK_CATEGORIES.includes(playbook.category), playbook.slug);
      assert.ok((TIER_SLUGS as readonly string[]).includes(playbook.recommendedScope), playbook.slug);
    }
  });

  it("state a reading time within a minute of the real word count", () => {
    for (const playbook of playbooks) {
      const stated = Number(/^(\d+) min read$/.exec(playbook.readTime)?.[1]);
      const actual = playbookWordCount(playbook) / WORDS_PER_MINUTE;
      assert.ok(Math.abs(stated - actual) <= 1, `${playbook.slug}: states ${stated} min, reads in ${actual.toFixed(1)} min`);
    }
  });

  it("have takeaways and complete sections", () => {
    for (const playbook of playbooks) {
      assert.ok(playbook.keyTakeaways.length >= 3, playbook.slug);
      for (const section of playbook.sections) {
        assert.ok(section.heading.trim(), playbook.slug);
        assert.ok(section.paragraphs.length > 0 && section.paragraphs.every(paragraph => paragraph.length > 40), `${playbook.slug}: ${section.heading}`);
      }
    }
  });
});
