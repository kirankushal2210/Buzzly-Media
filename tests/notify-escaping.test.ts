import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { escapeHtml } from "../lib/email.ts";
import { escapeDiscord, escapeSlack, escapeTelegram } from "../lib/notify.ts";

describe("outbound escaping", () => {
  it("Slack: neutralises angle brackets so user text can't create links or @channel", () => {
    assert.equal(escapeSlack("<!channel> <https://evil.example|click> & co"), "&lt;!channel&gt; &lt;https://evil.example|click&gt; &amp; co");
  });

  it("Discord: neutralises markdown, mentions and links", () => {
    const out = escapeDiscord("**bold** @everyone https://evil.example [x](y)");
    assert.ok(!out.includes("**bold**"));
    assert.ok(!out.includes("@everyone"));
    assert.ok(!out.includes("https://evil.example"));
  });

  it("Telegram HTML: escapes the three significant characters only", () => {
    assert.equal(escapeTelegram("<b>x</b> & y"), "&lt;b&gt;x&lt;/b&gt; &amp; y");
  });

  it("Email HTML: escapes quotes as well", () => {
    assert.equal(escapeHtml(`<img src=x onerror="alert('x')">`), "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;");
  });
});
