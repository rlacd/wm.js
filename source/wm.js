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
            this.maximized = false;

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
            this.onactivate = function(e) { }
            this.ondeactivate = function(e) { }
        }

        /**
         * [Internal] Creates the window and its components.
         * @param params The window creation parameters to use.
         */
        _createWindow(params) {
            // 1 - Construct window
            this.baseElement.classList.add('wm-window');
            this.baseElement.style.zIndex = (this.wm.zIndexStartOffset + this.id + 1);

            //  1.1 - Construct titlebar
            const titleBar = document.createElement('div');
            titleBar.classList.add('titlebar');

            const titleBarTitle = document.createElement('span');
            titleBarTitle.classList.add('title');

            const controlBox = document.createElement('div');
            controlBox.classList.add('control-box');
            controlBox.insertAdjacentHTML('beforeend', '<button role="minimize">─</button>'
             + (params.resizable ? '<button role="maximize">▢</button>' : '') //TODO check if window is resizable
             + '<button role="close">✕</button>');

            if(params.resizable) {
                titleBarTitle.addEventListener('dblclick', ()=>{
                    this.toggleMaximize();
                });

                controlBox.querySelector('button[role="maximize"]').addEventListener('click', ()=>{
                    this.toggleMaximize();
                });

                controlBox.querySelector('button[role="minimize"]').addEventListener('click', ()=>{
                    this.hide();
                    this.onminimize?.call();
                });

                controlBox.querySelector('button[role="close"]').addEventListener('click', ()=>{
                    this.onclose?.call();
                    this.close();
                });
            }

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
            this.baseElement.addEventListener('mousedown', ()=>{
                this.activate();
            });

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
         * Toggles whether the window is maximized.
         */
        toggleMaximize() {
            if(!this.maximized) {
                this._ogBounds = {
                    height: this.baseElement.style.height,
                    width: this.baseElement.style.width,
                    x: this.baseElement.style.left,
                    y: this.baseElement.style.top
                };

                this.baseElement.style.height = "100%";
                this.baseElement.style.width = "100%";
                this.baseElement.style.left = "0px";
                this.baseElement.style.top = "0px";

                this.baseElement.classList.add('maximized');
                this.maximized = true;

                this.onmaximize?.call();
            } else {
                this.baseElement.style.height = this._ogBounds.height;
                this.baseElement.style.width = this._ogBounds.width;
                this.baseElement.style.left = this._ogBounds.x;
                this.baseElement.style.top = this._ogBounds.y;

                this.baseElement.classList.remove('maximized');
                this.maximized = false;

                this.onrestore?.call();
            }
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
            return this.baseElement.querySelector('.content');
        }

        /**
         * Activates the window
         */
        activate() {
            if(this.baseElement.classList.contains('active'))
                return;

            this.wm.activate(this);
            this.onactivate?.call();
        }

        /**
         * Shows the window. If the window is already shown, this function will do nothing.
         */
        show() {
            if(this.shown)
                return;
            
            if(!this.registered) {
                this._registerWindow();
                this.onopen?.call();
            }
            
            this.baseElement.style.display = "flex";
            this.shown = true;

            this.onshown?.call();

            this.activate();
        }

        /**
         * Hides the window. `onminimize` only gets called if it is performed via the UI.
         */
        hide() {
            if(!this.shown) return;

            this.baseElement.style.display = "none";
            this.shown = false;
        }

        /**
         * Closes the window. Once it has been closed, the window is destroyed.
         */
        close() {
            this.wm.destroy(this);
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
            /** @type {WM_Window[]} */
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
            wnd.id = (this._createdWindows++);
            wnd._createWindow(options);
            this.windows.push(wnd);
            return wnd;
        }

        /**
         * Finds a window by id.
         * @param {Number} id The ID of the window to find.
         */
        findWindow(id) {
            return this.windows.find((x)=>x?.id == id);
        }

        /**
         * Destroys all windows. No events will be executed upon destruction.
         */
        destroyAll() {
            this.windows.forEach((v, i)=>{
                this.container.removeChild(v.baseElement);
                v.wm = null;
                v.baseElement = null;
                this.windows[i] = null;
                delete this.windows[i];
            });
        }

        /**
         * Destroys a window.
         * @param {WM_Window|Number} _wnd The window to destroy.
         */
        destroy(_wnd) {
            const wnd = (_wnd instanceof WM_Window) ? _wnd : this.findWindow(_wnd);

            if(!wnd.wm)
                return;

            this.container.removeChild(wnd.baseElement);
            wnd.baseElement = null;
            const wndIndex = this.windows.indexOf(wnd);
            this.windows[wndIndex] = null;
            delete this.windows[wndIndex];
        }

        /**
         * Activates a window.
         * @param {WM_Window|Number} _wnd The window to activate.
         */
        activate(_wnd) {
            const wnd = (_wnd instanceof WM_Window) ? _wnd : this.findWindow(_wnd);
            var highestZIndex = parseInt(wnd.baseElement.style.zIndex);

            this.windows.forEach((w, i, a)=>{
                if((a[i] == null) || (a[i].id == wnd.id))
                    return;
                
                if(a[i].baseElement.classList.contains('active')) {
                    a[i].baseElement.classList.remove('active');
                    a[i].ondeactivate?.call();
                }

                const zIndex = parseInt(w.baseElement.style.zIndex);

                if(zIndex > highestZIndex) {
                    highestZIndex = zIndex;
                }
            });

            wnd.baseElement.style.zIndex = highestZIndex + 1;
            wnd.baseElement.classList.add('active');
        }
    }

    return {
        WindowManager
    }
})();

window.WMJS = WMJS;