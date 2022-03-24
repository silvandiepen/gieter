---
icon: /media/icon_archive.svg
tags: documentation,archive
---
# Archives

You can create archives in specific types, archive pages won't be added to the menu and will be displayed in their parent as a list.

You can create an archive by creating a folder with a readme.md. An example;

`blog/readme.md`

```markdown
---
archive: blog
---

# Blog

Here you will find all my blogs
```

This will create a blog page. All other `.md` files will be shown as a list on the home blog page.

### Archive Types

#### Articles

Articles are dated, they can be all kinds of things. The overview will be tiles with images and the order will be defined by the filenames.

```md
---
archive: articles
---
```

#### Blog

A list of blogs, will be shown with dates. It will be shown as a list and ordered by their given date.

```md
---
archive: blog
---
```

#### Sections

When selecting type `sections` all child files will be loaded within the parent as sections. This is to create bigger pages consisting of multiple sections without having to add all the data to one single file.
```markdown
---
archive: sections
---
```