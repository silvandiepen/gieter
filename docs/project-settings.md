---
icon: /media/icon_project.svg
tags: documentation
---

# Project Settings

There are also a few project settings you can alter defining them in **any** of the markdown files.

```markdown
---
projectTitle: My Project Title
projectLogo: /media/my-logo.svg
projectIgnore: src, test
projectStyle: /assets/my-css.css
projectStyleOverrule: /assets/my-alt-css.css
---
```

**projectTitle** sets the title of the project, used everywhere in the title and as the logo when there is no logo defined.

**projectLogo** sets the logo image to be used in the header. If you don't have a file called "logo" but want to use another title, you can set it manually using the projectLogo

**projectIgnore**, sometimes there are folders you don't want to include in your project. If you have a separate docs folder or the markdown files in your source? You can add those folders here (comma separated, if multiple).

**projectStyle** defines another extra custom stylesheet. You add this stylesheet extra to your page.

**projectStyleOverrule** defines a new stylesheet and doesn't add the default stylesheet.
