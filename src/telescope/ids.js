const slugify = require("slugify");

let id_index = 0;
let node_ids = [];

module.exports = (title, type = null) => {
    let slug = slugify(title, { lower: true, strict: true });
    let key = [type, slug].filter((n) => n).join("-");

    let id = null;
    if (key !== null && node_ids[key] !== undefined) {
        id = node_ids[key];
    } else {
        id = id_index;
        node_ids[key] = id;
        id_index += 1;
    }

    return { slug, id };
};
