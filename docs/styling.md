---
icon: /media/icon_style.svg
tags: documentation
---

# Styling

#### Colors

In the custom file, you can redefine all the used colors; (`primary, secondary, background, foreground`).

You can redefine the dark and light color, which will automatically be used through dark and light mode.

All colors should be defined as the `*-rgb` custom property with just the three rgb values. In this way color can be used throughout all shades of color.

```css
:root {
  --gtr-dark-rgb: 19, 3, 29;
  --gtr-light-rgb: 235, 250, 255;
}
```

#### Sass

If you want, you can use a `scss` file for your custom styling, gieter will automatically generate this file and use the outcome as your custom styling.

In a scss you can do everything you can do with default `dart-sass` and you get all the options from (themer)[https://themer.sil.mt].

```scss
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;900&family=Red+Hat+Display:wght@400;700&display=swap");

:root {
  --gtr-primary-font-family: "Inter";
  --gtr-dark-rgb: #{rgbValues(#111111)};
  --gtr-light-rgb: #{rgbValues(#f7f7f7)};
  --gtr-primary-rgb: #{rgbValues(#ff0000)};
  --gtr-secondary-rgb: #{rgbValues(#00ff00)};
}
```

### Custom Pages and Sections

#### Sections

Sections are created automatically, but if you want to customize your section, there are a few build in.

| type  | description                                                                                                                              |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| intro | An into section will automatically get a min-height of 50 viewport height, center the text and give the headers and content a background 


In your file, you can define the sectionType in order to use these types.

```md
---
sectionType: intro
---
```

#### Backgrounds

Background images are also supported for sections and background. You can set a background image for the page or for a specific section.

```md
---
bodyBackground: /link-to-image.jpg
---
```

```md
---
sectionBackground: /link-to-image.jpg
---
```



