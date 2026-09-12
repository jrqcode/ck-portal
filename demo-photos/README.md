# demo-photos

Drop real job-site photos in this folder and `bun run seed:demo` uploads them to
the demo builds instead of the placeholder drawings it generates otherwise.

- `.jpg`, `.jpeg`, `.png`, or `.webp`
- Used in filename order, so name them `01-…`, `02-…` if the order matters
- Resized to 1600×1200 on the way up — originals straight off a phone are fine

The images themselves are not committed. Anything here other than this README is
ignored by git, so a folder of client photos never ends up in the repository.
