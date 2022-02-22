---
icon: /media/icon_media.svg
tags: documentation
---
# Media and Assets

When you have a `media` or `assets` folder, these will automatically be copied to your project. In that way you can use the files placed in these folders in your open letter.


### Favicon

You can automatically add a favicon by adding a favicon.png to an `assets` or `media` folder, this file will automatically get picked up and converted into a `.ico` favicon to be loaded. 


### Logo

You can automatically add a logo by adding a logo.svg/.png/.jpg/.gif to an `assets` or `media` folder, this file will automatically get picked up and and loaded in the header. When this is an svg, the data of the svg will be loaded instead of as an image. In this way you can alter the svg to pick up styling from the page like colors, etc. 

When you have multiple logo's (formats) or you want to specify another file than `logo.*`, you can add `projectLogo: assets/yourfile.png` to you settings. Otherwise the logo will be just automatically picked up in the above order. Where a `.jpg` will only be used if there is no `.svg` or `.png` defined, etc.. 