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
        /**
         * @member util
         */
        util: {
            /**
             * Makes an element draggable.
             * @param {HTMLElement} element The element to make draggable.
             * @param {Object} opts The options to use to make an element draggable.
             */
            draggable,

            /**
             * Animates an element.
             * @param {HTMLElement} element The element to animate.
             * @param {String} animation The name of the animation.
             */
            animate
        },
        /**
         * Window manager object.
         */
        WindowManager,
        /**
         * Window manager window object.
         */
        WM_Window
    }
})();

window.WMJS = WMJS;