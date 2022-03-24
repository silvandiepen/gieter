---
icon: /media/icon_settings.svg
tags: documentation, settings
---
# Settings

Gieter does not support any settings from the cli. Just to keep it as straightforward as possible.

But if you do want to change some things in your settings, of course you can.

You can alter a few settings in your files them self by adding meta data to your .md files.

###### Title

You can change the title of the file, which will be used in the title and menu by setting the title;

```markdown
---
title: My Custom Title
---
```

###### Date

When adding a date, the date will be added to your file or can be used in the lists. When you want to create a blog with dated posts, the posts will be ordered by date and the date will be displayed. Make sure you use the DD-MM-YYYY format.

```markdown
---
date: 2-12-2020
---
```

###### Hide

For instance a home file, you might not want to have in the menu's. In that case you can add the `hide: true` to your arguments and the file will be generated, but hidden from the menu.

```markdown
---
hide: true
---
```

###### Menu Children

By default the children of any parent page won't be shown in the menu. But when you add menuChildren to an acrhive, the articles will be displayed as children in the menu

```markdown
---
menuChildren: true
---
```