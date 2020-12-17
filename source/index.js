/*
wm.js (C) acdra1n 2020. Licensed under GNU GPLv3.
*/

import "./wm.js.css";
import "./misc/poly";
import { draggable } from "./util/draggable";
import { animate } from "./util/animation";
import { WM_Window } from "./core/window";
import { WindowManager } from "./core/wm";

/**
 * Main WMJS namespace.
 * 
 * This is what is exposed to the user of this library.
 */
const WMJS = (function() {
    return {
        util: {
            draggable,
            animate
        },
        WindowManager,
        WM_Window
    }
})();

window.WMJS = WMJS;