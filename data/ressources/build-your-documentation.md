---
chapter: "Getting started"
tag: [Build, NPM, Static site]
---

# Build your documentation

Telescope works as a static site generator.

Once you have created your markdown content, you need to compile the documentation.
This step will generate the static HTML pages and the graph structure.

Be sure to change in `config.js` the `base_url` property to the URL of your website.

To compile your markdown files, use the command :

```
npm run build
```

Static HTML files are generated in the `dist` folder. Copy the content of this folder on your website.

Telescope does not offer a command that watch your filesystem and recompiles on the fly.
