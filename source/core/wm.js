/*
wm.js (C) acdra1n 2020. Licensed under GNU GPLv3.
*/

import { WM_Window } from "./window";

/**
 * Window manager class.
 */
export class WindowManager {
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

        /* Window behaviors and placement */

        this.zIndexStartOffset = 10;

        this.animations = {
            wndOpen: null,
            wndClose: null
        }

        this.behavior = {
            applyDragStyles: false,
            useSimpleGraphics: false
        }

        /** Events */
        this.onwindowcreate = null;
        this.onwindowdestroy = null;
        this.onwindowactivate = null;
        this.onwindowdeactivate = null;

        /** Internal variables (these should not be touched and are therefore prefixed) */
        this._createdWindows = 0;

        containerEl._wm = {};

        this._setupContainerEvents();
    }

    /**
     * Sets up events for the window manager container.
     */
    _setupContainerEvents() {
        this.container.addEventListener('click', (e)=>{
            this.deactivateAll();
        });
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
            minHeight: 200,
            minWidth: 200,
            x: 10,
            y: 10,
            resizable: true,
            draggable: true
        }, params);

        const wnd = new WM_Window(this, options);
        wnd.id = (this._createdWindows++);
        wnd._createWindow(options);
        this.windows.push(wnd);
        this.onwindowcreate?.call(this, wnd, options);
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
     * Displays debug information in the window container.
     */
    showDebugInfo() {
        if(this._debugContainer)
            return;
        
        this._debugContainer = document.createElement('div');
        this._debugContainer.classList.add('wm-ui-dbginfo');
        
        // Add title
        const titleEl = document.createElement('b');
        titleEl.innerText = "wm.js alpha";
        titleEl.style.textDecoration = "underline";
        titleEl.style.display = "block";
        this._debugContainer.appendChild(titleEl);

        // Add stats
        const statsEl = document.createElement('span');
        this._debugContainer.appendChild(statsEl);

        this.container.appendChild(this._debugContainer);

        // Update stats
        this._updateDebugInfo();
        
        // Schedule debug updates every 500 ms
        this._debugProc = setInterval(()=>this._updateDebugInfo(), 500);
    }

    /**
     * Called whenever to update the debug info container.
     */
    _updateDebugInfo() {
        /** @type {DOMRect} */
        const r = this.container.getBoundingClientRect();

        const statsEl = this._debugContainer.querySelector("span");
        statsEl.innerHTML = "\n<u>:: General Information</u>\n" +
        " <b>Created Windows:</b> " + this._createdWindows + "\n" +
        " <b>Loaded Windows:</b> " + this.windows.length + "\n" +
        " <b>Active Window:</b> " + (()=> {
            const wnd = this.getActiveWindow();
            if(!wnd)
                return "null";
            else {
                const wndBounds = wnd.getWindowRect();
                return wnd.id + " => [" + Math.round(wndBounds.width) + "x" + Math.round(wndBounds.height) + "] (" + Math.round(wndBounds.x) + ", " + Math.round(wndBounds.y) + ")";
            }
        })() + "\n" + 
        " <b>WM Area: </b>" + Math.round(r.width) + "x" + Math.round(r.height) + "\n\n<u>:: Features</u>\n" +
        " <b>Fast Window Drag</b>: " + (this.behavior.applyDragStyles ? "Yes": "No") + "\n" +
        " <b>Simple Graphics Mode</b>: " + (this.behavior.useSimpleGraphics ? "Yes": "No");
    }

    /**
     * Returns the active window.
     */
    getActiveWindow() {
        /** @type {WM_Window} */
        let wnd = null;

        this.windows.forEach((w)=>{
            if(w == null)
                return;
            
            if(w.baseElement.classList.contains('active'))
                wnd = w;
        });

        return wnd;
    }

    /**
     * Destroys all windows. No events will be executed upon destruction.
     */
    destroyAll() {
        this.windows.forEach((v)=>{
            this.destroy(v);
        });

        this.windows = [];
    }

    /**
     * Destroys a window.
     * @param {WM_Window|Number} _wnd The window to destroy.
     */
    destroy(_wnd) {
        const wnd = (_wnd instanceof WM_Window) ? _wnd : this.findWindow(_wnd);

        if(!wnd.wm)
            return;

        this.onwindowdestroy?.call(this, wnd);
        this.container.removeChild(wnd.baseElement);
        wnd.baseElement = null;
        const wndIndex = this.windows.indexOf(wnd);
        this.windows[wndIndex] = null;
        this.windows.splice(wndIndex, 1);
    }

    /**
     * Deactivates all windows.
     */
    deactivateAll() {
        this.windows.forEach((w, i, a)=>{
            if(a[i] == null)
                return;
            
            if(a[i].baseElement.classList.contains('active')) {
                a[i].baseElement.classList.remove('active');
                a[i].ondeactivate?.call();
                this.onwindowdeactivate?.call(this, a[i]);
            }
        });
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
                this.onwindowdeactivate?.call(this, a[i]);
            }

            const zIndex = parseInt(w.baseElement.style.zIndex);

            if(zIndex > highestZIndex) {
                highestZIndex = zIndex;
            }
        });

        wnd.baseElement.style.zIndex = highestZIndex + 1;
        wnd.baseElement.classList.add('active');
        this.onwindowactivate?.call(this, wnd);
    }
}