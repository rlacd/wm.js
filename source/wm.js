/*
wm.js (C) acdra1n 2020. Licensed under GNU GPLv3.
*/

/**
 * Main WMJS namespace.
 */
const WMJS = (function() {
    /**
     * Window manager window.
     */
    class WM_Window {
        /**
         * Creates a new window.
         * @param {Object} params The parameters to use.
         */
        constructor(params) {
            /** @type {HTMLElement} */
            this.baseElement = document.createElement('div');

            this.registered = false;

            /* Events */
            this.onopen = function(e) { }
            this.onclose = function(e) { }
            this.onshown = function(e) { }
            this.onmaximize = function(e) { }
            this.onminimize = function(e) { }
            this.onrestore = function(e) { }

            // Create the window
            this._createWindow(params);
        }

        _createWindow() {
            
        }

        /**
         * [Internal] Registers the window.
         */
        _registerWindow() {
            this.registered = true;
        }

        getBounds() {

        }

        show() {

        }
    }

    /**
     * Window manager class.
     */
    class WindowManager {
        /**
         * Creates a new window manager.
         * @param {String|HTMLElement} containerEl The container element to use for the window manager.
         */
        constructor(containerEl) {
            if(!(containerEl instanceof HTMLElement))
                containerEl = document.querySelector(containerEl);
        
            if(!containerEl)
                throw new Error("The specified container element is not valid.");

            if(containerEl._wm)
                throw new Error("The specified container already has a window manager.");

            this.container = containerEl;
            this.windows = [];
            this._createdWindows = 0;
        }

        /**
         * Creates a new empty window.
         * @param params The window parameters to use.
         */
        createWindow(params) {
            const options = {};

            Object.assign(options, {
                title: "Untitled",
                height: 100,
                width: 100,
                x: 10,
                y: 10,
                resizable: true,
                draggable: true
            }, params);

            const wnd = new WM_Window(options);
            this.windows.push(wnd);
            return wnd;
        }
    }

    return {
        WindowManager
    }
})();

window.WMJS = WMJS;