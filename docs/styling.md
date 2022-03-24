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