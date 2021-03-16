---
title: Home
hide: true
projectTitle: media/logo.svg
projectStyle: media/custom.css
---

# Open letter

Open letter helps you make simple websites or pages just from a markdown file. You don't have to set anything up, just run `npx open-letter` and your website will be generated.

### Meta

| setting              | default         | description                                       |
| -------------------- | --------------- | ------------------------------------------------- |
| title                | Inherit from h1 | Set the title of a page                           |
| description          | none            | Sets the description for a specific page, overrules projectDescription when set |
| hide                 | false           | hides a page from the menu                        |
| projectTitle         | none            | set the title for the whole website               |
| projectDescription   | none            | set the description for the whole website               |
| projectLogo          | none            | set a logo for in the header                      |
| projectStyle         | none            | Set a custom style (loaded on top of the default) |
| projectStyleOverrule | none            | Set a style (instead of the default)              |


### Archives

You can create archives in specific types, archive pages won't be added to the menu and will be displayed in their parent as a list.

You can create an archive by creating a folder with a readme.md. An example;

`blog/readme.md`

```
---
type: blog
isArchive: true
---

# Blog

Here you will find all my blogs
```

This will create a blog page. All other `.md` files will be shown as a list on the home blog page.

### Archive Types

There are two types of archives, the "article" and the "blog", the difference is in how they articles are displayed. 



