module.exports = {
    base_url: "https://github.com/Greaby/telescope/",

    seed: "telescope",

    folders: {
        dist: "dist",
        data: "data",
        ressources: "data/ressources",
        tags: "data/tags",
        authors: "data/authors",
    },

    labels: {
        project_title: "Telescope",
        see_also: "See also",
        search: "Search",
        tags: "Tags",
        authors: "Authors",
    },

    graph: {
        node_min_size: 5,
        node_max_size: 25,
    },

    hide_isolated_tags: false,
    isolated_tags_threshold: 2,
};
