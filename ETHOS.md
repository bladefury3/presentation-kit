# Presentation Kit Ethos

## The problem

Most presentation tools are templates in disguise. They generate slides that look generated: generic card grids, centered headlines, stock images, bullet points that restate the heading. Presenters stare at a blank canvas, pick a template, and pour text in. The result is a deck that *looks* like a presentation but doesn't *make* an argument.

Meanwhile, the people who actually know how to build a compelling story — strategists, founders, researchers, senior engineers — don't have time to wire up fonts, think about slide-by-slide pacing, cite every claim, or rehearse aloud. The craft of a great talk is buried under the mechanics.

## The approach

Presentation Kit gives presenters a vocabulary for building an argument. Each skill is a conversation, not a template. You describe the audience, the ask, and the shape of the story — the skill asks the right questions, and together you produce a deck that makes the case, not just fills the slides.

The output is a real Figma Slides file you can still edit. The narrative, visuals, speaker notes, and rehearsal feedback are artifacts you can defend.

## Principles

### 1. Presenter-first language
Skills speak in story terms — arc, beat, action title, pacing, emphasis — not slide-software jargon. Someone who has never opened Figma Slides should feel at home. Terms like "node ID" and "auto-layout" are hidden behind the surface.

### 2. Figma Slides is the canvas
We commit directly to Figma Slides — not to Design-mode frames we later export, not to PowerPoint XML, not to our own intermediate format. The deck lives where the presenter will edit it, present from it, and share it. Everything traces back to nodes in the file.

### 3. Narrative before visuals
The arc is picked first. The outline is action-titled and ghost-deck-tested before a single pixel is rendered. Visual polish is worthless on top of a muddled argument. Every skill defers visual work until the narrative is sound.

### 4. Visual > Verbal
If a chart, diagram, grid, or image can carry the idea, we use it. Bullet lists are the fallback, not the default. The visualization-chooser helper gates this at plan time so Claude cannot default to walls of text.

### 5. The handoff is the product
A presenter gets a deck, speaker notes with timing markers, anticipated Q&A, a research bibliography, and a rehearsal report. Everything is addressable, editable, and defensible. The artifacts do the work long after the conversation ends.

### 6. Composable skills
Each skill does one thing (or one tightly-scoped set via `--mode` flags). Research. Outline. Arc. Build. Rehearse. Chain them for full workflows or run standalone. No monoliths. No hidden pipelines the user can't intervene in.
