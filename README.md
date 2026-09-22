# Mirror of the live site

Copies of pages from `https://jb.apdstack.com`, so they can be worked on here
and previewed like the rest of the pages in this repository. Taken 2026-09-08.

| File | Live URL |
| --- | --- |
| `index.html` | `/experiences/cannes-yachting-festival` |
| `locations.html` | `/locations` |

They share one `assets/` folder, since they load the same stylesheets, the
same fonts and the same scripts. The folder is still named after the event
page, which was the first one copied here.

It is a mirror, not the source. Anything changed here has to be applied to the
real site by whoever owns that codebase — this folder is where the change gets
designed and shown, not where it ships from.

What was rewritten to make it stand on its own:

- every `/assets/…` the page names is downloaded under `assets/`, and the
  references in the HTML are relative
- stylesheets keep their own depth: `url(/assets/…)` became `url(../../assets/…)`
- `assets/js/jby-intro.js` asked for the intro logo by absolute path; that one
  is relative now too

Still pointing outward, deliberately: Font Awesome from cdnjs, the Crisp chat
widget, and every in-site link (`/about`, `/brands/…`, `/experiences`), which
resolve against whatever host serves the copy.
