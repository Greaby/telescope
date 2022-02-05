module.exports = {
    base_url: "https://github.com/Greaby/telescope/",
    language: "en",

    seed: "telescope",

    folders: {
        dist: "dist",
        data: "data",
        ressources: "data/ressources",
    },

    labels: {
        project_title: "Telescope",
        see_also: "See also",
        search: "Search",
    },

    ressource: {
        color: "#D24335",
    },

    current_node: {
        color: "#F2C84B",
    },

    metadata: {
        tag: {
            label: "Tags",
            color: "#87AA66",
            display_on_graph: true,
            display_on_page: true,
        },
        chapter: {
            label: "Chapter",
            color: "#4CB3D2",
            display_on_graph: true,
            display_on_page: true,
        },
    },
    hide_isolated_metadata: false,
    isolated_metadata_threshold: 2,

    graph: {
        node_min_size: 5,
        node_max_size: 25,
    },
};
