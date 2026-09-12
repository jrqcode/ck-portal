# demo-photos

Drop real job-site photos in this folder and `bun run seed:demo` uses them
instead of the CC0 stock set in `scripts/demo/stock/`.

- `.jpg`, `.jpeg`, `.png`, or `.webp`
- Resized to 1600×1200 on the way up — originals straight off a phone are fine

**Name them for the build stage they belong to** and they land on the right
updates: a file with `foundation` in its name goes on foundation updates,
`kitchen` on interior-finishing ones. The words that match are in
`STAGE_KEYWORDS` in `scripts/demo/images.ts` — roughly `permit`, `site`,
`foundation`, `framing`, `roof`, `plumbing`, `drywall`, `kitchen`, `landscaping`,
`inspection`, `keys`. A numeric prefix wins outright: `03-anything.jpg` is
stage 3 whatever else the name says.

Anything that matches nothing still gets used, just wherever a stage has nothing
of its own. A stage with no photo at all falls back to the generated
illustration, so a half-filled folder still produces a complete demo.

The images themselves are not committed. Anything here other than this README is
ignored by git, so a folder of client photos never ends up in the repository.
