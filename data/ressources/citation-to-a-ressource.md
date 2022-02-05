---
chapter: "Advanced"
tag: [Ressource, Metadata, Citation]
citations: ["ressource:metadata"]
---

# Citation to a ressource

The citation system allows you to link one resource to another.
You can also create a citation for any metadata.

To create a citation, add an array field "citations" to the YAML front matter in the header of your markdown file.

The citation must contain the type of resource and its slug.
As an example, this page quotes the page about metadata.

```
---
citations: ["ressource:metadata"]
---
```

Unlike a metadata, citations do not appear in the record but create a link in the graph.
