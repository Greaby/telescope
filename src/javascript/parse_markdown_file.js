var fs = require("fs");
const MarkdownIt = require("markdown-it");
const blockEmbedPlugin = require("markdown-it-block-embed");
const MarkdownItTitle = require("markdown-it-title");
const MarkdownItMeta = require("markdown-it-meta");

module.exports = async (file_path) => {
    const content = await fs.promises.readFile(file_path, "utf-8");

    const md = new MarkdownIt({
        linkify: true,
        breaks: false,
    });
    md.use(MarkdownItMeta);
    md.use(MarkdownItTitle);
    md.use(blockEmbedPlugin, {
        containerClassName: "embed",
    });

    let env = {};
    let render = md.render(content, env);

    return { render, env, meta: md.meta };
};
