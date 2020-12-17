/*
wm.js (C) acdra1n 2020. Licensed under GNU GPLv3.
*/

import { animate } from "../util/animation";
import { draggable } from "../util/draggable";
import { resizable } from "../util/resizable";

/**
 * Window manager window object.
 */
export class WM_Window {
    /**
     * Constructs a new window object.
     * @param {WindowManager} wm The window manager.
     */
    constructor(wm) {
        /** @type {HTMLElement} */
        this.baseElement = document.createElement('div');

        this.registered = false;
        this.shown = false;
        this.maximized = false;

        /** @type {WindowManager} */
        this.wm = wm;
        this.id = 0;
        this.type = "normal";

        /* Events */
        this.onopen = null;
        this.onclose = null;
        this.onshown = null;
        this.onmaximize = null;
        this.onminimize = null;
        this.onrestore = null;
        this.onactivate = null;
        this.ondeactivate = null;
        this.ondragstart = null;
        this.ondragend = null;
        this.ondrag = null;
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
            + '<button role="maximize">▢</button>'
            + '<button role="close">✕</button>');

        if(params.resizable) {
            titleBarTitle.addEventListener('dblclick', ()=>{
                this.toggleMaximize();
            });

            controlBox.querySelector('button[role="maximize"]').addEventListener('click', ()=>{
                this.toggleMaximize();
            });
        }

        controlBox.querySelector('button[role="minimize"]').addEventListener('click', ()=>{
            this.hide();
            this.onminimize?.call();
        });

        controlBox.querySelector('button[role="close"]').addEventListener('click', ()=>{
            this.onclose?.call();
            this.close();
        });
        

        titleBar.appendChild(titleBarTitle);
        titleBar.appendChild(controlBox);

        //  1.2 - Construct contents container
        const contentsContainer = document.createElement('div');
        contentsContainer.classList.add('content');

        // 2 - Apply parameters
        this.baseElement.style.position = "fixed";
        this.baseElement.style.height = (typeof params.height == 'string') ? params.height : params.height + "px";
        this.baseElement.style.width = (typeof params.width == 'string') ? params.width : params.width + "px";
        this.baseElement.style.left = (typeof params.x == 'string') ? params.x : params.x + "px";
        this.baseElement.style.top = (typeof params.y == 'string') ? params.y : params.y + "px";

        titleBarTitle.innerText = params.title;

        //  2.1 - Register components
        this.baseElement.appendChild(titleBar);
        this.baseElement.appendChild(contentsContainer);
        this.baseElement.addEventListener('mousedown', (e)=>{
            this.activate();
        });

        this.baseElement.addEventListener('click', (e)=>e.stopPropagation());

        // 3 - Create draggable handler (resize is still WIP)
        if(params.draggable)
            this.setDraggable();

        if(params.resizable)
            this.setResizable(params.minWidth, params.minHeight);
    }

    /**
     * [Internal] Registers the window.
     */
    _registerWindow() {    
        this.wm.container.appendChild(this.baseElement);
        this.registered = true;
    }

    /**
     * [Internal] Makes the window draggable.
     */
    setDraggable(enabled = true) {
        if(enabled) {
            draggable(this.baseElement, {
                cancel: ".content,.control-box,.ui-resizable-handle,.wm-resizer",
                ondragstart: (a, b)=>{
                    // Enable drag shadow if behavior is enabled
                    if(this.wm.behavior.applyDragStyles)
                        this.baseElement.classList.add('dragging');

                    // Call window event
                    this.ondragstart?.call(this, a, b);
                },
                ondragend: (a, b)=>{
                    if(this.wm.behavior.applyDragStyles)
                        this.baseElement.classList.remove('dragging');

                    // Call window event
                    this.ondragend?.call(this, a, b);
                },
                ondrag: (a, b)=>{
                    // Call window event
                    this.ondrag?.call(this, a, b);
                }
            });
        } else
            draggable(this.baseElement, "destroy");
    }

    /**
     * [Internal] Makes the window resizable.
     */
    setResizable(mw, mh, enabled = true) {
        if(enabled) {
            resizable(this.baseElement, {
                onresizestart: ()=>{
                    this.activate();
                },
                minWidth: mw,
                minHeight: mh
            });
        } else
            resizable(this.baseElement, "destroy");
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
            this.baseElement.style.position = "relative";
            this.baseElement.style.boxShadow = "none";

            this.baseElement.classList.add('maximized');
            this.maximized = true;
            this.setDraggable(false);

            this.onmaximize?.call();
        } else {
            this.baseElement.style.height = this._ogBounds.height;
            this.baseElement.style.width = this._ogBounds.width;
            this.baseElement.style.left = this._ogBounds.x;
            this.baseElement.style.top = this._ogBounds.y;
            this.baseElement.style.position = "fixed";
            this.baseElement.style.boxShadow = "";

            this.baseElement.classList.remove('maximized');
            this.maximized = false;
            this.setDraggable(true);

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
     * Sets the html contents of the window.
     * @param {String} html The HTML to use.
     */
    setHtml(html) {
        const contents = this.getContentContainer();

        while(contents.firstChild)
            contents.removeChild(contents.firstChild);

        contents.innerHTML = html;
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
     * Sets the window title.
     * @param {String} text The window title to use.
     */
    setTitle(text) {
        this.baseElement.querySelector(".titlebar>.title").innerText = text;
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

            if(this.wm.animations.wndOpen)
                animate(this.baseElement, this.wm.animations.wndOpen);
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
        if(this.wm.animations.wndClose)
            animate(this.baseElement, this.wm.animations.wndClose).then(()=>this.wm.destroy(this));
        else
            this.wm.destroy(this)
    }

    /**
     * Sets the control box style.
     * @param opts The style options to use.
     */
    setControlBoxStyle(opts) {
        const options = {};

        Object.assign(options, {
            close: true,
            maximize: true,
            minimize: true
        }, opts);

        const controlBox = this.baseElement.querySelector(".control-box");

        const closeBtn = controlBox.querySelector('button[role="close"]');
        const minBtn = controlBox.querySelector('button[role="minimize"]');
        const maxBtn = controlBox.querySelector('button[role="maximize"]');

        options.close ? closeBtn.style.display = "" : closeBtn.style.display = "none";
        options.minimize ? minBtn.style.display = "" : minBtn.style.display = "none";
        options.maximize ? maxBtn.style.display = "" : maxBtn.style.display = "none";
    }
}
