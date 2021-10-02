const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const { Readable } = require("stream");

const config = require("../../config");

module.exports = async (links) => {
    const stream = new SitemapStream({ hostname: config.base_url });
    const sitemap = await streamToPromise(
        Readable.from(links).pipe(stream)
    ).then((data) => data.toString());

    fs.writeFile(`${config.folders.dist}/sitemap.xml`, sitemap, function (err) {
        if (err) return console.log(err);
    });
};
