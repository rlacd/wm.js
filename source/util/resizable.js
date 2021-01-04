/*
wm.js (C) acdra1n 2020. Licensed under GNU GPLv3.
*/

var startX = 0;
var startY = 0;
var startWidth = 0;
var startHeight = 0;
var originalBounds = null;
var resizeHandle = "se";
var resizeTarget = null;

/**
 * Makes an element resizable.
 * @param {HTMLElement} _element The element to make resizable.
 * @param {Object} opts The options to use.
 */
export function resizable(_element, opts) {
    const element = (_element instanceof HTMLElement) ? _element : document.querySelector(_element);

    if(opts == "destroy") {
        if(!element._rsz)
            return;

        for(let el of element.children) {
            /** TODO implement */
        }

        element._rsz = null;
        return;
    }

    if(element._rsz)
        return;

    const options = {};

    Object.assign(options, {
        onresizestart: null,
        onresize: null,
        onresizeend: null,
        handles: "se,ne,e,s,sw,w,nw,n",
        minHeight: null,
        minWidth: null
    }, opts);

    options.handles = options.handles.split(',');

    element._rsz = options;

    for(let handle of options.handles) {
        const resizer = document.createElement('div');
        resizer.classList.add('wm-resizer');
        resizer.classList.add(handle);
        element.appendChild(resizer);
        resizer.addEventListener('mousedown', (e)=>initDrag(e, element, handle), false);
    }
}

function initDrag(e, target, handle) {
    resizeTarget = target;
    resizeHandle = handle;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(document.defaultView.getComputedStyle(resizeTarget).width, 10);
    startHeight = parseInt(document.defaultView.getComputedStyle(resizeTarget).height, 10);
    originalBounds = resizeTarget.getBoundingClientRect();
    resizeTarget.style.userSelect = "none";

    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);

    resizeTarget._rsz.onresizestart?.call(resizeTarget._rsz, { startX, startY, startWidth, startHeight });
}

function doDrag(e) {
    let sz = {
        width: startWidth + e.clientX - startX,
        height: startHeight + e.clientY - startY
    };

    if(resizeHandle == "nw") {
        sz = {
            width: startWidth - e.clientX + startX,
            height: startHeight - e.clientY + startY
        };
    } else if(resizeHandle == "ne") {
        sz = {
            width: startWidth + e.clientX - startX,
            height: startHeight - e.clientY + startY
        };
    } else if(resizeHandle == "n") {
        sz.height = startHeight - e.clientY + startY;
    } else if(resizeHandle == "sw") {
        sz = {
            width: startWidth - e.clientX + startX,
            height: startHeight + e.clientY - startY
        };
    } else if(resizeHandle == "w") {
        sz.width = startWidth - e.clientX + startX;
    }

    let canResizeW = true;
    let canResizeH = true;

    if(resizeTarget._rsz.minHeight != null)
        if(sz.height < resizeTarget._rsz.minHeight)
            canResizeH = false;
    
    if(resizeTarget._rsz.minWidth != null)
        if(sz.width < resizeTarget._rsz.minWidth)
            canResizeW = false;
            

    if(resizeHandle == "se") {
        if(canResizeW)
            resizeTarget.style.width = (startWidth + e.clientX - startX) + 'px';
        
        if(canResizeH)
            resizeTarget.style.height = (startHeight + e.clientY - startY) + 'px';
    } else if(resizeHandle == "ne") {
        if(canResizeW)
            resizeTarget.style.width = (startWidth + e.clientX - startX) + 'px';

        if(canResizeH) {
            resizeTarget.style.height = (startHeight - e.clientY + startY) + 'px';
            resizeTarget.style.top = startY + e.clientY - startY + 'px';
        }
    } else if((resizeHandle == "e") && canResizeW) {
        resizeTarget.style.width = (startWidth + e.clientX - startX) + 'px';
    } else if((resizeHandle == "s") && canResizeH) {
        resizeTarget.style.height = (startHeight + e.clientY - startY) + 'px';
    } else if(resizeHandle == "sw") {
        if(canResizeW) {
            resizeTarget.style.left = originalBounds.left + e.clientX - startX + 'px';
            resizeTarget.style.width = (startWidth - e.clientX + startX) + 'px';
        }

        if(canResizeH)
            resizeTarget.style.height = (startHeight + e.clientY - startY) + 'px';
    } else if((resizeHandle == "w") && canResizeW) {
        resizeTarget.style.left = originalBounds.left + e.clientX - startX + 'px';
        resizeTarget.style.width = (startWidth - e.clientX + startX) + 'px';
    } else if(resizeHandle == "nw") {
        if(canResizeW) {
            resizeTarget.style.left = originalBounds.left + e.clientX - startX + 'px';
            resizeTarget.style.width = (startWidth - e.clientX + startX) + 'px';
        }
        
        if(canResizeH) {
            resizeTarget.style.height = (startHeight - e.clientY + startY) + 'px';
            resizeTarget.style.top = startY + e.clientY - startY  + 'px';
        }
    } else if((resizeHandle == "n") && canResizeH) {
        resizeTarget.style.height = (startHeight - e.clientY + startY) + 'px';
        resizeTarget.style.top = startY + e.clientY - startY  + 'px';
    }

    resizeTarget._rsz.onresize?.call(resizeTarget._rsz, sz);
}

function stopDrag(e) {
    resizeTarget.style.userSelect = "";
    document.documentElement.removeEventListener('mousemove', doDrag, false);
    document.documentElement.removeEventListener('mouseup', stopDrag, false);

    resizeTarget._rsz.onresizeend?.call(resizeTarget._rsz, {
        width: startWidth + e.clientX - startX,
        height: startHeight + e.clientY - startY
    });

    resizeTarget = null;
}