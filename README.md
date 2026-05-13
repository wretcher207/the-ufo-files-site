# the-ufo-files-site

Interactive investigation site for the May 8, 2026 PURSUE UFO file release plus FBI 62-HQ-83894.

Reads case content as a git submodule from [`wretcher207/the-ufo-files`](https://github.com/wretcher207/the-ufo-files).

An archive by [Dead Pixel Design](https://deadpixeldesign.com).

## Local development

```sh
git clone --recurse-submodules https://github.com/wretcher207/the-ufo-files-site
cd the-ufo-files-site
npm install
npm run dev
```

If you cloned without submodules, fetch them:

```sh
git submodule update --init --recursive
```

## Updating the archive content

The site pins to a specific commit of `the-ufo-files`. To pull the latest archive content:

```sh
git submodule update --remote content/archive
git add content/archive
git commit -m "Sync archive content"
```

## Build

```sh
npm run build      # Astro build + Pagefind index
npm run preview    # Preview the production build locally
```
