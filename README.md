![wmjs logo](/res/wmjs-logo-small.png)

A rock solid, easy to use window manager for the web, written in JavaScript.

Copyright (C) acdra1n 2020. Licensed under GNU GPLv3.

## What is wm.js?

wm.js is a window manager for the web, written in JavaScript. It allows draggable and resizable windows to be created within a specified container.

This library is particularly useful for web apps which utilize custom dialogs and windows within their page. It is also useful for a cloud OS (aka web OS, such as `os.js`) which simulate a desktop experience.

## How to install

Reference either the minified files (found in `dist/`) to get started using wm.js.

Please note that the source files require an ES6 compliant browser. The distribution files have been transpiled to ES5 compatible syntax, to preserve compatibility with older browser.

## How to build

wm.js uses `webpack` as its build system. To build wm.js from source, run `npm install` to install dependencies, then run `npm run build` to build a new version.

The output files will be placed in `dist/` by default.

## Compatibility

Currently, there is no accurate compatibility table. The one listed below is approximate.

Chrome | Internet Explorer | Firefox
------ | ----------------- | --------
45+    | 11                | 52

## Examples

**Creating a window**

```javascript
var wm = new WMJS.WindowManager(document.body); // Container element does not have to be limited to `document.body`

var wnd = wm.createWindow({
    title: "Test Window",
    height: 315,
    width: 450,
    x: 25,
    y: 25,
    minHeight: 200,
    minWidth: 200,
    draggable: true,
    resizable: true
});

wnd.setHtml("Test Window!");
wnd.show();
```

Not all properties have to be specified. If one is left empty, a default value will be used instead.

## Filing issues

If you found a bug or problem, please open an issue at the issues page.

Note that you must tag your issues correctly to prevent them from being dismissed!