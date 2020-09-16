![wmjs logo](/res/wmjs-logo-small.png)

A rock solid, easy to use window manager for the web, written in JavaScript.

Copyright (C) acdra1n 2020. Licensed under GNU GPLv3.

## What is wm.js?

wm.js is a window manager for the web, written in JavaScript. It allows draggable and resizable windows to be created within a specified container.

This library is particularly useful for web apps which utilize custom dialogs and windows within their page. It is also useful for a cloud OS (aka web OS, such as `os.js`) which simulate a desktop experience.

## How to install

Reference either the minified files (found in `dist/`) or the source files (found in `source/`) in your HTML document to get started using wm.js.

Please note that the source files require an ES6 compliant browser. The distribution files have been transpiled to ES5 compatible syntax, to preserve compatibility with older browser.

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
    y: 25
});

wnd.getContentContainer().innerHTML = "Test Window!";
wnd.show();
```

## Important Notes

Currently, there is no window dragging and resizing system. If you want to resize and drag windows anyway, you can use jQuery UI (or any other dragging library). 

⚠ Please note that this is not officially supported; you may encounter numerous bugs.

To make a window resizable and draggable using jQuery UI, try the following code snippet:

```javascript
var wm = new WMJS.WindowManager(document.body);
var wnd = wm.createWindow({title: "test window"});

wnd.show();

$(wnd.baseElement).draggable({
    cancel: ".content,.control-box"
}).resizable({
    handles: 'n, s, w, e, ne, se, sw, nw'
});
```

## Filing issues

If you found a bug or problem, please open an issue at the issues page.

Note that you must tag your issues correctly to prevent them from being dismissed!