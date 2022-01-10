# Telescope

<p>
    <a href="https://github.com/Greaby/telescope/issues">
      <img alt="Issues" src="https://img.shields.io/github/issues/greaby/telescope?color=D94D4C" />
    </a>
    <a href="https://github.com/Greaby/telescope/pulls">
      <img alt="Pull requests" src="https://img.shields.io/github/issues-pr/greaby/telescope?color=ECA539" />
    </a>
</p>

Telescope allows you to create a collaborative documentation that will be generated as a static site with an interactive graph to explore the content.

## How to install

The project require Node.js 16+

1. Clone this repository 
2. Install the dependencies using the command `npm install`

## Write your documentation

Unlike a wiki where the pages have a hierarchy. In Telescope, we add cards in which we add the content.
Each card is structured in a [Markdown](https://www.markdownguide.org/getting-started/) file to define its metadata. This will be used to generate the static HTML pages.

There are three types of cards: Resources, Authors and Tags.
The main cards that is used to generate the graph are the resources. Authors and tags are automatically generated from the metadata of your resources.

A card template is available [here](https://github.com/Greaby/telescope/blob/main/data/template.md)

Add your content to the `data/ressources` folder

The `index.md` file in the `data` folder is used to generate the `index.html` file. Modify it to add the home page of your project.

## How to build the static website

1. Be sure to change in `config.js` the `base_url` property to the URL of your website.
2. Build the static website using the command `npm run build`
3. Static HTML files are generated in the `dist` folder. Copy the content of this folder on your website.

## Sample projects using Telescope

* [Galaxie GD](https://greaby.github.io/galaxie-gd/)
