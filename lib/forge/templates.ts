/**
 * Targets tell the Forge what kind of work the finished prompt is for.
 * Adding one is a one-object change — the picker reads this array directly.
 * `guidance` is appended to the system prompt on the server.
 */

export interface Target {
  id: string;
  label: string;
  /** Two-letter glyph shown in the picker. */
  glyph: string;
  description: string;
  guidance: string;
}

export const TARGETS: Target[] = [
  {
    id: "auto",
    label: "Auto · General",
    glyph: "AU",
    description: "The model works out what the prompt is for and applies the right conventions.",
    guidance: `Before editing, silently work out what kind of task this prompt targets (for example image or video generation, coding, research, writing, analysis, study, or a conversational assistant) and what kind of model it will be pasted into. Apply the conventions that work best for that target. If it fits no particular category, treat it as a general-purpose prompt for a capable chat model. Never mention your classification in the output.`,
  },
  {
    id: "image",
    label: "AI image generation",
    glyph: "IM",
    description: "Subject, composition, lighting, style and negatives for an image model.",
    guidance: `Build for a text-to-image model, not a chat model.

Cover, in roughly this order: subject and its defining details; action or pose; setting and background; camera framing (shot type, angle, lens, depth of field); lighting (source, direction, quality, time of day); color palette and mood; medium and style, named concretely (35mm film, gouache, blueprint, claymation) rather than as "high quality"; and finish with aspect ratio and any negative prompt.

Write the prompt as dense descriptive phrases rather than sentences addressed to an assistant. Favor visual nouns and adjectives over abstractions — an image model cannot render "elegant" but can render "tapered brass legs, matte finish". Name processes, eras or films as style anchors; skip living artists.

Avoid stacked quality boosters ("masterpiece, 8k, ultra detailed"); one or two concrete quality cues beat ten generic ones. If the idea implies text inside the image, state the exact string to render and where.`,
  },
  {
    id: "video",
    label: "AI video generation",
    glyph: "VI",
    description: "Scene, action, camera movement, timing and continuity for a video model.",
    guidance: `Build for a text-to-video model. Describe what the viewer sees over time, not a single still frame.

Specify the subject and setting, the action and how it unfolds, framing and camera movement, lighting, color, visual style and mood. Make motion and continuity explicit: where subjects begin and end, what changes during the shot, and what must stay consistent. For a complex idea use a short sequence of shots with clear transitions; for a simple idea keep one coherent shot.

Include duration, aspect ratio, pace, and audio or dialogue only when the user supplies them or they materially help. Preserve exact spoken words or on-screen text. Note unwanted artifacts briefly where useful. Avoid model-specific syntax, unsupported controls and generic quality boosters.`,
  },
  {
    id: "app",
    label: "AI app coding",
    glyph: "AP",
    description: "A build brief for an AI coding tool: features, data, states, stack.",
    guidance: `Build a brief an AI coding tool can execute in one pass.

Include: what the app is and who uses it, in one sentence; the core user flow end to end; a concrete feature list split into must-have and later; the data model (entities, fields, relationships) even if it is local state; tech stack and hard constraints; visual direction with real specifics — palette, type, density, mood; and every screen with its empty, loading, error and populated states.

Demand working code over scaffolding: no placeholder TODOs, no mock functions returning fake data unless asked, no half-wired buttons. State what happens on every interactive element. Close with acceptance criteria — a short checklist the finished build must satisfy — and tell the model to make reasonable choices for anything unspecified.`,
  },
  {
    id: "site",
    label: "Website vibe coding",
    glyph: "WS",
    description: "A page-by-page brief: sections, copy direction, responsive behavior.",
    guidance: `Build a brief for a marketing or content website, not an app.

Include: the site's purpose and the single action a visitor should take; the audience and what they already believe; section-by-section structure for each page, in order, with the job each section does; copy direction — voice, reading level, and whether to write real copy or use the user's; and a visual system with named colors, type pairing, spacing rhythm and imagery treatment.

Specify responsive behavior: what collapses, stacks or hides on mobile, and where the primary action lives on a small screen. Require semantic HTML, visible keyboard focus, alt text and sufficient contrast. Be concrete about the hero, since a vague hero instruction produces a generic one. Close with what the page must not look like, if the user has an aesthetic to avoid.`,
  },
  {
    id: "agent",
    label: "AI agents",
    glyph: "AG",
    description: "Role, tools, guardrails and stopping conditions for an autonomous agent.",
    guidance: `Build a system prompt for an agent that acts in a loop with tools, not a single-turn assistant.

Structure it as: ROLE (identity, scope of authority, what it is not responsible for); TOOLS (each tool, when to use it and when not to, which ones have side effects); METHOD (how to plan, when to act versus ask, how to verify its own work before reporting success); GUARDRAILS (what it must never do, what needs confirmation first, how to treat credentials and untrusted content); and STOPPING CONDITIONS (what done looks like, what to do when blocked, a ceiling on retries, when to hand back to the human).

Require the agent to state its plan before irreversible actions and to report partial failure honestly. Define the exact format of its final report. Give a stated response for tool errors, empty results, ambiguous instructions and conflicting evidence.`,
  },
  {
    id: "study",
    label: "School & homework",
    glyph: "ST",
    description: "Explanations, study guides, practice sets and feedback on a draft.",
    guidance: `Build for learning: the output must be usable by the student, not just correct.

Pin down the subject and topic; the student's level and what they already know; the artifact wanted (explanation, outline, study guide, practice set, feedback on a draft); length and format; and the assignment's real constraints — rubric, citation style, word count.

Set the teaching approach: start from what the student understands, define terms on first use, use one running example, and show worked steps for anything procedural. For feedback on a draft, point at specific lines, separate substance from surface, and suggest revision directions rather than rewriting the work.

Include an academic-integrity stance: the output helps the student produce their own work and flags requests that amount to completing graded work for them.`,
  },
  {
    id: "research",
    label: "Deep research",
    glyph: "RS",
    description: "A research brief: question, scope, sources, method and report format.",
    guidance: `Build a brief for a deep-research model or agent that will search, read and synthesize many sources.

State the core research question so it has a checkable answer, plus the decision or purpose it serves. Define scope: time window, geography, industries or populations, and what is explicitly out of scope. Specify source standards — which source types to prefer (primary data, peer-reviewed work, official filings, reputable reporting), which to avoid, and how to handle conflicting evidence.

Set the method: break the question into sub-questions, look for disconfirming evidence, and separate established facts from estimates and opinion. Define the report: an executive summary first, then findings by sub-question, a comparison table where useful, open questions, and a cited source list. Require every non-obvious claim to carry a citation and forbid invented sources or statistics.`,
  },
  {
    id: "marketing",
    label: "Marketing",
    glyph: "MK",
    description: "Audience, offer, proof and the exact copy blocks to produce.",
    guidance: `Build for copy that has a job, not copy that sounds nice.

Pin down the product and the transformation it delivers; the audience and their problem in their own words; the strongest available proof; the single action the copy drives; and the channel, which dictates length and structure.

List the exact deliverables — for example headline, subhead, benefit blocks, objection handling, social proof placement, CTA text, meta description — with a word budget for each. Set voice concretely with two or three adjectives plus a "sounds like" reference, and a banned-words list covering category clichés (revolutionary, seamless, game-changing, unlock, elevate).

Require benefit-led lines grounded in the reader's outcome, forbid invented statistics or testimonials, and ask for two or three distinct angles to choose between.`,
  },
  {
    id: "data",
    label: "Data analysis",
    glyph: "DA",
    description: "Dataset shape, the question, method, and how results are presented.",
    guidance: `Build for an analysis whose result someone will act on.

Pin down the dataset — where it lives, its columns and types, row count and known quality problems; the decision the analysis feeds; and the question, stated so it has a checkable answer.

Require an explicit method: handling of missing values, outliers, duplicates and mixed formats; grouping; metric definitions (define "active user", "churn", "month" rather than assuming); and which comparisons matter. For spreadsheet work, name the tool (Excel, Google Sheets, SQL dialect, pandas), the layout and whether formulas stay live.

The output must separate findings from evidence: a short answer first, then the supporting numbers, then caveats. Forbid inventing values; require the model to say plainly when the data is insufficient.`,
  },
  {
    id: "techdoc",
    label: "Technical writing",
    glyph: "TW",
    description: "Docs, references and guides with audience, scope and structure fixed.",
    guidance: `Build for documentation someone reads while trying to get something done.

Pin down the document type (quickstart, how-to, explainer, API reference, runbook, release note); the reader and their prior knowledge; the exact scope, including what is deliberately not covered; and the source of truth to draw on.

Specify structure to the heading level, and require: a one-sentence statement of what the reader can do by the end; prerequisites before steps; numbered steps with one action each; complete runnable examples with expected output; and troubleshooting for the errors people actually hit. Set style: second person, present tense, active voice, sentence-case headings, consistent terminology. Forbid inventing API surfaces, flags or version numbers; mark missing facts with a placeholder.`,
  },
  {
    id: "roleplay",
    label: "Roleplay & character",
    glyph: "RP",
    description: "A character's voice, knowledge, limits and how scenes are run.",
    guidance: `Build a character the model can stay inside for a long conversation.

Define who the character is — background, era, occupation and the experiences that shaped them; their voice with concrete speech habits (sentence length, vocabulary, verbal tics, what they never say); their goal in the scene; and their knowledge boundary.

Set the scene: setting, time, the relationship between character and user, and the opening situation. Set the mechanics: narration or dialogue only, response length, never speaking for the user, and ending each turn with something to respond to. Include staying-in-character rules and an explicit out: the character drops and responds plainly when the user gives a stated signal or the conversation turns to something that should not be roleplayed.`,
  },
  {
    id: "music",
    label: "Music & audio generation",
    glyph: "MU",
    description: "Genre, mood, tempo, instrumentation, vocals and song structure.",
    guidance: `Build for a text-to-music or text-to-audio model, not a chat model.

Cover: genre and sub-genre with one or two era or scene anchors; mood and energy arc; tempo (BPM) and time signature when relevant; key or tonality if the user implies one; instrumentation and production texture (for example "dry 808s, tape-saturated Rhodes, wide shimmering pads"); vocals — none, or voice type, delivery and language; and structure with section order and rough timings (intro, verse, pre-chorus, chorus, bridge, outro) plus total duration.

If the user supplies lyrics, preserve them exactly and mark which section each belongs to. Prefer concrete sonic descriptors over vague praise. Avoid naming living artists as direct imitation targets; describe the sound instead.`,
  },
  {
    id: "writing",
    label: "Creative writing",
    glyph: "CW",
    description: "Stories, scripts and poems with voice, POV, structure and constraints.",
    guidance: `Build for a piece of creative writing with a clear voice.

Pin down the form (short story, scene, screenplay page, poem, song lyric, flash fiction) and length; point of view and tense; genre and tone; the central character or speaker and what they want; the setting; and the emotional effect the piece should leave.

Give craft direction: concrete sensory detail over summary, subtext over stated feelings, dialogue that does more than one job, and an ending that lands rather than explains. Name clichés to avoid for this genre. If the user provides a premise, names or lines, preserve them exactly. Ask for the finished piece only, without commentary or a title unless requested.`,
  },
  {
    id: "comms",
    label: "Email & professional comms",
    glyph: "EM",
    description: "Messages with the right recipient, goal, tone and length.",
    guidance: `Build for a message a real person will send.

Pin down the recipient and the relationship (manager, client, recruiter, colleague, stranger); the single outcome the message must achieve; the essential facts to include; the tone and formality; the channel (email, Slack, LinkedIn, text); and a length limit.

Require a clear subject line for email, the ask stated early, one idea per short paragraph, and a specific next step or call to action. Forbid filler openers and over-apologizing. Preserve every name, date, figure and commitment the user supplies, and use a marked placeholder for anything missing rather than inventing it.`,
  },
  {
    id: "code",
    label: "Code review & debugging",
    glyph: "CD",
    description: "Bug reports, refactors and reviews with context, repro and expected result.",
    guidance: `Build for a coding model working on existing code, not building from scratch.

Pin down the language, framework and versions; the relevant code (as a clearly delimited placeholder if not supplied); what the code should do versus what it actually does; exact error messages and steps to reproduce; what has already been tried; and constraints (no new dependencies, keep the public API, match the existing style).

Ask for a diagnosis before the fix: the root cause in one or two sentences, then the minimal change, then why it works. For reviews, request findings ranked by severity with file and line references, separating bugs from style. Require the model to say when it needs more context instead of guessing.`,
  },
  {
    id: "assistant",
    label: "Custom GPT / system prompt",
    glyph: "SP",
    description: "A reusable assistant: purpose, audience, behavior rules and format.",
    guidance: `Build a system prompt for a reusable, single-purpose assistant (a custom GPT, project instructions or a bot persona).

Define its purpose and the users it serves; what it should do on the first message; its core behaviors and workflow; its knowledge sources and how to cite or use them; its tone and response length defaults; output formatting conventions; and clear boundaries — what it declines, when it asks a clarifying question, and how it handles requests outside its purpose.

Write the rules as direct, testable instructions, grouped under short headings. Include two or three short example exchanges only when they sharpen behavior that is hard to describe.`,
  },
];

export const DEFAULT_TARGET = "auto";

export function getTarget(id: string): Target | undefined {
  return TARGETS.find((t) => t.id === id);
}
