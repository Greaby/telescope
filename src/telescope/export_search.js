const fs = require("fs");
const config = require("../../config");

module.exports = async (links) => {
    fs.writeFile(
        `${config.folders.dist}/search.json`,
        JSON.stringify(links),
        function (err) {
            if (err) return console.log(err);
        }
    );
};
