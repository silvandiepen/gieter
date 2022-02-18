---
icon: /media/icon_archive.svg
tags: documentation
---
# Archives

You can create archives in specific types, archive pages won't be added to the menu and will be displayed in their parent as a list.

You can create an archive by creating a folder with a readme.md. An example;

`blog/readme.md`

```markdown
---
type: blog
isArchive: true
---

# Blog

Here you will find all my blogs
```

This will create a blog page. All other `.md` files will be shown as a list on the home blog page.

### Archive Types

There are two types of archives, the `articles` and the `blog`, the difference is in how they articles are displayed.
