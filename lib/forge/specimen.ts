/**
 * A pre-forged specimen: one raw prompt and what each dial stop does to it.
 * Static text, so the home page never spends API credits.
 */
export const SPECIMEN_RAW =
  "write a cover letter for a barista job, i have 2 years at starbucks and i'm good with customers. make it sound good";

export const SPECIMEN_STOPS: string[] = [
  `Write a cover letter for a barista job. I have two years of experience at Starbucks and I'm good with customers. Make it sound polished.`,

  `Write a one-page cover letter for a barista position. Highlight my two years of experience at Starbucks and my strength with customers. Keep the tone warm, confident and professional.`,

  `Write a cover letter for a barista position.

About me: two years as a barista at Starbucks; strong with customers, including regulars and rush-hour crowds.

What to emphasize: reliability, speed under pressure, and friendly service that keeps people coming back.

Tone: warm and confident, not stiff.
Length: under 300 words, three or four short paragraphs.
Use placeholders for [CAFÉ NAME] and [HIRING MANAGER NAME].`,

  `You are a hiring-savvy career coach who writes cover letters for hospitality roles.

Task: Write a cover letter for a barista position at [CAFÉ NAME].

Candidate background:
- Two years as a barista at Starbucks
- Strong customer skills: builds rapport with regulars, stays calm during rush hours

Requirements:
- Open with a specific, genuine reason for wanting this café, not a generic greeting.
- Show reliability, speed and customer care through one short, concrete example.
- Warm, confident and natural; avoid clichés like "I am writing to express my interest".
- Under 300 words, 3–4 short paragraphs, addressed to [HIRING MANAGER NAME].

Output: the letter only, ready to paste.`,

  `ROLE
You are a career coach who specializes in hospitality hiring and writes cover letters that get interviews.

TASK
Write a cover letter for a barista position that makes the hiring manager want to meet the candidate.

INPUTS
- Café: [CAFÉ NAME] — if blank, write so it fits any independent or chain café.
- Hiring manager: [HIRING MANAGER NAME] — if blank, use "Dear Hiring Team".
- Experience: two years as a barista at Starbucks.
- Strength: excellent with customers (regulars, rush hours, difficult moments).

CONSTRAINTS
- 220–300 words, 3–4 short paragraphs, plain text.
- Warm, confident, specific. No clichés, no exaggeration, no invented achievements.
- Weave in one concrete moment that shows speed and care under pressure.

OUTPUT FORMAT
1. Greeting
2. Hook: why this café, in one or two sentences
3. Evidence: experience and customer skills, with the example
4. Close: availability and a clear next step

QUALITY BAR
A great letter sounds like a real person, could only have been written for a barista role, and gives the manager one memorable detail.

EDGE CASES
If details are missing, keep the placeholders visible rather than guessing. Return only the letter.`,
];
