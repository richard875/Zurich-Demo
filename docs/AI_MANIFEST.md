# AI Development Manifest and Strategy

Zurich Direct (demo) · Richard Everley, with Claude and Claude Code · 23 October 2026

Some engineers, me included on some days, doubt that AI-written code matches a careful human's. The leverage is not in doubt: this repo (front end, back end, AWS, CI/CD and about 115 automated tests) took 134 commits in 88 hours. It came from a strategy, not from asking Claude Code to "build me an app".

## Principles

- **Judgement moves; it doesn't go away.** Mine goes into the spec before the code, and into the review after it.
- **Two tools, one owner.** Claude, in chat, plans and never touches code. Claude Code builds and never sets scope. I decide and approve.
- **Evidence in, proof out.** Specs come from real sources, not a model's memory. Tests, budgets and screenshots decide when a step is done.

## The loop, every phase

1. **Gather** the inputs in `docs/`: emails, the job description, saved Zurich pages, the real application flow.
2. **Plan with Claude:** a plan, a brief for Claude Code and a kick-start prompt. I push back until they're right.
3. **Kick off Claude Code.** It proposes its plan, flags what doesn't fit, and waits for my "go".
4. **Build in steps,** each ending with a short report and screenshots at desktop and mobile widths.
5. **Gate the risky parts:** deploys, AWS changes and new dependencies need my explicit yes.
6. **Fix small things the same way,** with a targeted prompt and options to pick from.

## Claude Code's side

I build what the briefs describe, prove it works, and leave the calls to Richard.

- **Brief first.** I sent a plan before each phase and waited for "go". When a brief and the code disagreed, I asked. Phase 3's brief wanted every section visible without JavaScript, but the app's streamed pages need it. Richard agreed to keep streaming.
- **Proof, not claims.** From Phase 2, each step ended with 1440px and 375px screenshots. Phase 3 added recordings and budget measurements.
- **Not right first time.** The Motion library added 17.6 KB of first-load JavaScript against a 10 KB budget. The Step 1 measurements caught it. Richard chose my CSS alternative, which cost 1.4 KB.
- **Taste and approvals.** In Phase 2, Richard picked from three cover-tab layouts. Deploying stayed his call.
