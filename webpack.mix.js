const config = require("./config");

const Telescope = require("./src/telescope/telescope");
const telescope = new Telescope();
telescope.generate();

let mix = require("laravel-mix");
mix.setPublicPath(config.folders.dist);
mix.setResourceRoot(".");
mix.options({
    legacyNodePolyfills: false,
});
mix.webpackConfig({
    resolve: { fallback: { http: false } },
    output: {
        filename: "js/[name].js",
        chunkFilename: "js/chunks/[name].js",
    },
});
mix.sass("src/scss/app.scss", "");
mix.js("src/javascript/app.js", "");
mix.copy("src/static", `${config.folders.dist}/static`);
mix.disableNotifications();
