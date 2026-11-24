import type { TierSlug } from "@/lib/engagements";

/**
 * Inbound playbooks for /insights and /insights/[slug], statically generated.
 * Add an entry to publish a new playbook. Keep them free of invented
 * statistics or client claims; tests/insights.test.ts checks each `readTime`
 * against the real word count.
 */
export type PlaybookCategory = "Strategy" | "Content Engine" | "Distribution";

export interface Playbook {
  slug: string;
  title: string;
  subtitle: string;
  category: PlaybookCategory;
  readTime: string; // e.g. "5 min read"
  publishedAt: string; // ISO date
  keyTakeaways: string[];
  sections: { heading: string; paragraphs: string[]; callout?: string }[];
  recommendedScope: TierSlug;
}

export const PLAYBOOK_CATEGORIES: PlaybookCategory[] = ["Strategy", "Content Engine", "Distribution"];

export const playbooks: Playbook[] = [
  {
    slug: "why-production-fails-without-distribution",
    title: "Why Cinema-Grade Production Fails Without a Distribution Engine",
    subtitle: "A beautiful film nobody sees is a cost, not an asset. How to plan distribution before the camera rolls, so every shoot keeps paying back.",
    category: "Strategy",
    readTime: "5 min read",
    publishedAt: "2026-11-23",
    keyTakeaways: [
      "Distribution is the first decision of a shoot, not the last step after the edit.",
      "Plan every cut-down, format and opening line before the shot list is final.",
      "Each piece needs one destination: a profile, a page or a message, never “just views”.",
      "Release on a cadence and let early results decide what gets pushed harder.",
    ],
    sections: [
      {
        heading: "The film was excellent. Nothing happened.",
        paragraphs: [
          "Most brand films are judged on the day they are delivered. The grade is right, the founder looks confident, the music lands, and everyone in the room is proud of it. Then the file is uploaded once to the website and once to social, shared by the team and a few friends, and it quietly stops moving. A month later it has done almost nothing for the business.",
          "This is rarely a craft problem. The lighting, the sound and the edit were all fine. The problem is that distribution was treated as something that happens after production, when it should have shaped production from the very first conversation.",
          "Cinema-grade production earns trust that phone footage often cannot. It signals care, investment and seriousness. But trust only forms in people who actually see the work, and on today’s platforms being seen is not automatic. It is engineered.",
        ],
      },
      {
        heading: "Platforms decide how far a piece travels",
        paragraphs: [
          "A film has no reach of its own. Instagram, YouTube and LinkedIn each decide how widely to show a piece based on how people behave around it: whether they stop scrolling, how long they keep watching, and whether they save, share, comment or follow. Those signals are collected in the first seconds and the first hours.",
          "A ninety-second hero film cut once for a website header gives the platforms very little to work with. It opens slowly, because it was designed to be watched start to finish by someone who already chose to press play. In a feed, nobody chose. The opening has to earn every second.",
          "That is why the same production can either disappear or compound depending on what happens around it. The footage is identical. The distribution plan is what differs.",
        ],
        callout: "The footage is identical. The distribution plan is what decides whether it disappears or compounds.",
      },
      {
        heading: "Plan the cut-downs before the shoot",
        paragraphs: [
          "If formats are only decided after the edit, the team ends up cropping wide shots into vertical frames and hunting for a hook that was never filmed. The fix is to decide the outputs first and let them shape the shot list. A single shoot day should be designed to produce a flagship piece for the website and long-form channels, several vertical reels each built around one idea, short founder or expert clips that answer real buyer questions, and stills that work without sound.",
          "Write each of those into the plan. Film with vertical safe areas in mind on purpose rather than by accident. Record the opening line of every reel as its own take, with two or three variations, so the edit has real options instead of compromises.",
          "This is also where budget is protected. A crew, a location and talent cost roughly the same whether the day produces one film or fifteen usable pieces. Planning the outputs up front is the cheapest growth decision in the whole project.",
        ],
      },
      {
        heading: "Brief the crew for distribution, not just for the film",
        paragraphs: [
          "Most production briefs describe a film: the story, the look, the locations, the people on camera. Very few describe where the footage will end up. That gap shows up on set, when the director of photography frames everything for a wide screen and nobody has thought about what a phone will show.",
          "A distribution-aware brief adds a short list for every person on the crew. The camera team needs to know which moments must also work as vertical frames and close-ups. The sound recordist needs clean takes of every opening line, because those lines will be cut out and reused on their own. Whoever is directing talent needs the list of questions that will become separate clips, so each answer is given as a complete thought that makes sense without the question in front of it.",
          "It also helps to name one person on set whose only job is to watch the plan. They tick off each format as it is captured and flag what is missing before the location is packed away. It is a small role, but it is usually the difference between a shoot that produces one film and a shoot that produces a month of material.",
          "None of this makes the flagship film worse. Directors often find that the discipline of planning short, self-contained moments makes the long version tighter too.",
        ],
      },
      {
        heading: "Give every piece a destination",
        paragraphs: [
          "Views do not pay for production. Enquiries, bookings and sales do. Every piece needs one clear next step for the viewer who is interested: follow the profile, visit a specific page, send a message or book a call. If the post does not say where to go, most interested viewers will not go looking.",
          "That destination has to be ready before anything is published. A landing page that speaks to the same audience as the film converts far better than a generic homepage, and it lets you see which pieces actually bring people through the door.",
        ],
        callout: "Decide where a piece will live, and what the viewer should do next, before you book the camera.",
      },
      {
        heading: "Release on a cadence, not a launch date",
        paragraphs: [
          "A single launch day spends the whole production in one moment. If the opening misses, the work is gone. Spreading the cut-downs across several weeks turns the production into a series of experiments: each release shows which openings hold attention and which topics people save and share.",
          "Use those results to decide what happens next. Put more effort, and eventually paid support, behind the pieces that are already working. Retire the ones that are not. Feed what you learn into the brief for the next shoot. That loop is what turns a one-off film into a distribution engine.",
          "Cinema-grade production is worth the investment. It just has to be built inside a system that makes sure the right people see it, and gives them somewhere to go when they do.",
        ],
      },
    ],
    recommendedScope: "launch-sprint",
  },
  {
    slug: "engineering-the-first-three-seconds",
    title: "Engineering the First 3 Seconds: How We Script Short-Form Video for Retention",
    subtitle: "The opening decides whether anything else in your video is seen. A practical scripting method for hooks that hold attention.",
    category: "Content Engine",
    readTime: "6 min read",
    publishedAt: "2026-11-23",
    keyTakeaways: [
      "Script the first three seconds as their own piece of work, separate from the rest.",
      "Start from one idea with tension in it, never a broad topic.",
      "Write and film at least three different openings for every script.",
      "Say it, show it and caption it at the same moment, for viewers watching without sound.",
      "Use retention graphs to find drop-off points and fix them with new information or a cut.",
    ],
    sections: [
      {
        heading: "Why the opening gets its own script",
        paragraphs: [
          "On short-form platforms the viewer decides almost immediately whether to keep watching. They have not chosen your video; it simply arrived in their feed between two others. If the opening does not earn the next few seconds, the rest of the script, however good, is never seen by most of the people it reaches.",
          "So we treat the first three seconds as a separate creative problem. The body of a reel explains, demonstrates or tells a story. The opening has one job only: make the right person stop and want the next sentence. Mixing those jobs is the most common reason good content underperforms.",
          "This is also where platform signals start. Early retention is one of the strongest indicators a platform has that a piece is worth showing to more people, so a stronger opening improves reach as well as watch time.",
        ],
      },
      {
        heading: "Start with an idea, not a topic",
        paragraphs: [
          "“Our new menu” is a topic. “The dish our chef refused to put on the menu for two years” is an idea. A topic gives you nothing to open with except an announcement. An idea arrives with tension built in: a question the viewer wants answered, a claim they want to test, or a contradiction they want resolved.",
          "Before any script is written we reduce it to a single sentence: what is the one thing a viewer should remember? If that sentence is vague, the opening will be vague too. If it is sharp, the opening often writes itself.",
          "A useful test is to imagine the idea as a message to a friend. Would they reply asking for more? If not, keep looking for the angle that makes it interesting before spending time on production.",
        ],
        callout: "A topic gives you nothing to open with. An idea arrives with tension already built in.",
      },
      {
        heading: "Write three openings for every script",
        paragraphs: [
          "We never commit to a single hook on paper. For each idea we write at least three openings that approach it from different directions, and all three are filmed so the edit and the data can decide which one ships.",
          "The first is the claim: a direct, specific statement the viewer wants to check, such as a surprising price, a time, or a rule you break on purpose. The second is the question: the exact words your buyer types into search or asks at the counter, spoken back to them. The third is the visual: an opening shot that is unusual, satisfying or unexpected enough to stop the thumb before a word is said.",
          "Different audiences respond to different styles, and the only reliable way to know which works for yours is to try them. Filming the alternatives costs a few extra minutes on set and saves weeks of guessing afterwards.",
        ],
      },
      {
        heading: "Say it, show it and caption it together",
        paragraphs: [
          "A large share of short-form video is watched with the sound off, at least at first. That means the opening has to work on three channels at once. The first frame should carry the idea visually, the first line should say it out loud, and on-screen text should reinforce it in as few words as possible.",
          "When any one of those is missing, part of the audience never gets the point. A beautiful first frame with no text loses the sound-off viewer. A great spoken line over a slow establishing shot loses everyone who is skimming. Aligning all three is simple, but it has to be planned in the script rather than patched in the edit.",
        ],
      },
      {
        heading: "Cut the warm-up",
        paragraphs: [
          "Greetings, logos, “so today we’re going to talk about” and slow pans belong at the end, if they belong anywhere. Start in the middle of the action, or at the moment something changes. Most scripts get stronger when the first sentence is simply deleted.",
          "The same rule applies on set. Ask the speaker to begin the line already in motion, mid-gesture or mid-task, rather than from a still, neutral pose. Those half-seconds matter more at the start of a reel than anywhere else.",
        ],
        callout: "If the first sentence could be removed without losing anything, remove it.",
      },
      {
        heading: "Match the opening to the platform",
        paragraphs: [
          "The same idea rarely opens best in the same way everywhere. Instagram Reels and YouTube Shorts reward openings that create curiosity immediately, because viewers are moving fast and scrolling past anything that looks like an introduction. LinkedIn viewers are often watching with a professional question in mind, so an opening that names a specific problem in their work tends to hold them better than a visual surprise.",
          "That does not mean writing three separate videos. It usually means filming one strong body and two or three openings, then pairing each platform with the opening that suits its audience. A claim might lead on Reels, a question on LinkedIn, and the visual on Shorts, while the remaining twenty-five seconds stay identical.",
          "Captions and on-screen text deserve the same attention. Phrasing that feels natural on one platform can read as clickbait on another. Write the on-screen line for the audience you expect there, and keep it short enough to read in the time the opening is on screen.",
          "Finally, look at the first frame as a still image. On several platforms it doubles as the cover in grids and search results. If it does not make sense on its own, the opening loses part of its job before anyone presses play.",
        ],
      },
      {
        heading: "Hand the edit a clear brief",
        paragraphs: [
          "Scripts that work on paper can still fail in the edit if the editor does not know which moments matter most. We hand over every script with the chosen opening marked, the one idea written at the top, and a note on where we expect attention to dip. That gives the editor permission to cut hard in the places that drag, instead of preserving every line that was filmed.",
          "The best edits for retention are often shorter than the first assembly by a surprising margin. Removing a single sentence of setup, or starting on the second take of a line where the speaker is more energetic, can change how the whole piece performs.",
        ],
      },
      {
        heading: "Pace the body for the drop-off points",
        paragraphs: [
          "Once the opening holds, the next risk is the slow middle. Retention graphs show exactly where viewers leave. Typical weak spots are any long explanation, a section that repeats what was already said, and the moment the viewer feels they have got the point.",
          "At each of those moments, give them a reason to stay: change the shot, add a new piece of information, reveal a result, or tease what is coming next. Keep the payoff close to the end so the final seconds feel worth watching, and keep the call to action short and specific.",
        ],
      },
      {
        heading: "Close the loop with your own data",
        paragraphs: [
          "After publishing, compare how many viewers stayed past the opening on each version and each idea. Keep a simple log of which hook styles worked for which audience and platform, along with the exact wording that was used.",
          "Over a few weeks that log becomes the most valuable scripting tool you have, because it is built on your audience rather than on general advice. It tells you which claims, questions and visuals your buyers respond to, and it makes every new script start from evidence instead of instinct.",
        ],
      },
    ],
    recommendedScope: "growth-engine",
  },
  {
    slug: "turning-organic-views-into-b2b-pipeline",
    title: "Turning Organic Views Into Inbound B2B Pipeline Without Paid Ad Bloat",
    subtitle: "Organic content can bring in qualified B2B enquiries if you design the path from view to conversation. A step-by-step approach.",
    category: "Distribution",
    readTime: "5 min read",
    publishedAt: "2026-11-23",
    keyTakeaways: [
      "In B2B, content’s job is recognition and trust, then one small next step.",
      "Build topics from the questions buyers ask before they talk to sales.",
      "Put a consistent expert on camera; trust attaches to people more than logos.",
      "Design the bridge from view to conversation: call to action, landing page, short qualifying form, fast reply.",
      "Track enquiries per piece, and only add paid support behind what already converts.",
    ],
    sections: [
      {
        heading: "What organic content is actually for in B2B",
        paragraphs: [
          "B2B buyers watch short-form video too, on the same phones and the same platforms as everyone else. They just rarely buy from it directly. Purchases involve several people, longer timelines and real risk for whoever recommends the supplier.",
          "So the job of organic content in B2B is not to close a sale. It is to make the right people recognise a problem they have, trust the person explaining it, and take one small, low-risk next step. Pipeline comes from designing that path deliberately, not from buying more impressions and hoping some of them convert.",
        ],
      },
      {
        heading: "Build topics from buyer questions",
        paragraphs: [
          "Start from the questions buyers ask before they are ready to talk to sales. What does this usually cost? How long does it take? What goes wrong? How do I compare suppliers? What should I ask before I sign? Your sales team hears these every week, and your website analytics and search data show many more.",
          "Each of those questions is a piece of content. Answered clearly and honestly, they attract people who are already looking for a solution, which is far more valuable than a large audience that is not. They also shorten sales calls, because prospects arrive already understanding the basics.",
        ],
        callout: "Every question your sales team hears each week is a piece of content waiting to be made.",
      },
      {
        heading: "Put an expert on camera, consistently",
        paragraphs: [
          "In B2B, trust attaches to people more than to logos. A founder or specialist explaining a real problem in plain language does more for credibility than a polished brand montage. Buyers want to know who they will actually be working with.",
          "Consistency matters more than production value here: the same face, talking about the same subject, week after week. Over time, the audience starts to associate that person with the problem, and that association is what turns a viewer into an enquiry when the need becomes urgent.",
        ],
      },
      {
        heading: "Design the bridge from view to conversation",
        paragraphs: [
          "Most B2B content fails at the handoff. A viewer is interested and there is nowhere obvious to go, so they leave and forget. The bridge has to be designed in small, specific steps.",
          "Start with a clear call to action in the post itself: follow for the series, read the full guide, or send a message with a keyword. Send traffic to a landing page built for that audience rather than the generic homepage. Use a short form that qualifies the enquiry with a few useful questions such as goal, timeline and budget range. Then reply fast, ideally with a way to book a call immediately while interest is high.",
          "Each step should feel like a natural continuation of the content the person just watched. If the landing page talks about something different, the momentum is lost.",
        ],
      },
      {
        heading: "Turn one answer into a full funnel",
        paragraphs: [
          "A single well-answered buyer question can serve every stage of the journey if it is cut and placed deliberately. The short vertical version works at the top, where people are discovering the problem. A longer explainer on YouTube or LinkedIn serves the people who want to understand it properly. A written version on your website captures search traffic from buyers typing the question directly, and gives your sales team something to send after a first call.",
          "Plan these together. When the expert sits down to record an answer, capture a tight sixty-second version and a fuller five-minute version in the same session. Transcribe the long version and turn it into an article with the same headings. Each format points to the next: the short clip invites people to the full explanation, the explanation invites them to the guide, and the guide invites them to a conversation.",
          "This also solves the consistency problem. One recording session a month, planned around the questions buyers ask most, can keep every channel supplied without anyone feeling they are constantly producing content from scratch.",
          "Over time, the library of answers becomes a sales asset in its own right. New prospects often watch several pieces before they ever get in touch, and arrive already convinced that you understand their situation.",
        ],
      },
      {
        heading: "Make the handoff to sales deliberate",
        paragraphs: [
          "When an enquiry arrives from content, the first reply matters more than usual. The prospect has been learning from your expert, so they expect continuity. Reference the piece that brought them in, answer their question directly, and offer a short call with someone who can go deeper. A generic sales sequence at this point undoes much of the trust the content built.",
          "Share the content library with the sales team as well. When they know which pieces exist, they can send the right answer at the right moment in a deal instead of writing long explanations from scratch.",
        ],
      },
      {
        heading: "Track enquiries, not just views",
        paragraphs: [
          "Add a source to every link and ask “where did you find us?” on every form. Within a few weeks you can see which topics, formats and platforms bring real conversations, which is very different from knowing which ones bring views.",
          "Some of the most valuable pieces will have modest reach but bring in exactly the right buyers. Without source tracking, those pieces look like failures and get dropped.",
        ],
        callout: "The metric that matters is enquiries per piece of content, not impressions per post.",
      },
      {
        heading: "Add paid support last",
        paragraphs: [
          "Paid promotion is useful once you know what works. Put budget behind posts that already bring enquiries organically, aimed at audiences that resemble the people who responded. That keeps spend small and focused instead of paying to test unproven ideas.",
          "Organic B2B pipeline is slower to start than a campaign, but it compounds. Every useful answer you publish keeps working long after it goes live, and every enquiry teaches you what to make next.",
        ],
      },
    ],
    recommendedScope: "full-stack-partner",
  },
];

export const playbookBySlug = (slug: string) => playbooks.find(playbook => playbook.slug === slug);

/** All readable words in a playbook, used for reading-time checks. */
export function playbookWordCount(playbook: Playbook) {
  return [playbook.subtitle, ...playbook.keyTakeaways, ...playbook.sections.flatMap(section => [section.heading, ...section.paragraphs])]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function formatPlaybookDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}
