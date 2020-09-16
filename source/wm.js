/*
wm.js (C) acdra1n 2020. Licensed under GNU GPLv3.
*/

/**
 * Main WMJS namespace.
 */
const WMJS = (function() {
    /**
     * [Internal] Window manager window object.
     */
    class WM_Window {
        /**
         * Constructs a new window object.
         * @param {Object} params The parameters to use.
         */
        constructor(wm, params) {
            /** @type {HTMLElement} */
            this.baseElement = document.createElement('div');

            this.registered = false;
            this.shown = false;

            /** @type {WindowManager} */
            this.wm = wm;
            this.id = 0;

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

        /**
         * [Internal] Creates the window and its components.
         * @param params The window creation parameters to use.
         */
        _createWindow(params) {
            // 1 - Construct window
            this.baseElement.classList.add('wm-window');

            //  1.1 - Construct titlebar
            const titleBar = document.createElement('div');
            titleBar.classList.add('titlebar');

            const titleBarTitle = document.createElement('span');
            titleBarTitle.classList.add('title');

            const controlBox = document.createElement('div');
            controlBox.classList.add('control-box');
            controlBox.insertAdjacentHTML('beforeend', '<button role="minimize">─</button>'
             + '<button role="maximize">▢</button>' //TODO check if window is resizable
             + '<button role="close">✕</button>');

            titleBar.appendChild(titleBarTitle);
            titleBar.appendChild(controlBox);

            //  1.2 - Construct contents container
            const contentsContainer = document.createElement('div');
            contentsContainer.classList.add('content');

            // 2 - Apply parameters
            this.baseElement.style.position = "absolute";
            this.baseElement.style.height = (typeof params.height == 'string') ? params.height : params.height + "px";
            this.baseElement.style.width = (typeof params.width == 'string') ? params.width : params.width + "px";
            this.baseElement.style.left = (typeof params.x == 'string') ? params.x : params.x + "px";
            this.baseElement.style.top = (typeof params.y == 'string') ? params.y : params.y + "px";

            titleBarTitle.innerText = params.title;

            //  2.1 - Register components
            this.baseElement.appendChild(titleBar);
            this.baseElement.appendChild(contentsContainer);

            // 3 - Create draggable handlers/resizable handlers (TODO)
        }

        /**
         * [Internal] Registers the window.
         */
        _registerWindow() {    
            this.wm.container.appendChild(this.baseElement);
            this.registered = true;
        }

        /**
         * Return a rectangle containing the bounds of the current window.
         */
        getWindowRect() {
            const boundRect = this.baseElement.getBoundingClientRect();
            
            return {
                x: boundRect.x,
                y: boundRect.y,
                height: boundRect.height,
                width: boundRect.width
            };
        }

        /**
         * Returns the content container element (essentially the element used for window contents).
         * @returns {HTMLElement} The content container element.
         */
        getContentContainer() {
            return this.baseElement.querySelector('content');
        }

        /**
         * Shows the window. If the window is already shown, this function will do nothing.
         */
        show() {
            if(this.shown)
                return;
            
            this.onopen?.call();
            
            if(!this.registered)
                this._registerWindow();
            
            this.baseElement.style.display = "flex";
            this.shown = true;

            this.onshown?.call();

            //TODO code here to activate window
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
            // Check if provided container is a valid element.

            if(!(containerEl instanceof HTMLElement))
                containerEl = document.querySelector(containerEl);
        
            if(!containerEl)
                throw new Error("The specified container element is not valid.");

            if(containerEl._wm)
                throw new Error("The specified container already has a window manager.");

            /** Variables */
            this.container = containerEl;
            this.windows = [];
            this.zIndexStartOffset = 10;

            /** Internal variables (these should not be touched and are therefore prefixed) */
            this._createdWindows = 0;

            containerEl._wm = {};
        }

        /**
         * Creates a new empty window.
         * @param params The window parameters to use.
         * @returns {WM_Window} The newly created window object.
         */
        createWindow(params) {
            const options = {};

            Object.assign(options, {
                title: "Untitled",
                height: 315,
                width: 450,
                x: 10,
                y: 10,
                resizable: true,
                draggable: true
            }, params);

            const wnd = new WM_Window(this, options);
            wnd.id = (++this._createdWindows);
            this.windows.push(wnd);
            return wnd;
        }
    }

    return {
        WindowManager
    }
})();

window.WMJS = WMJS;