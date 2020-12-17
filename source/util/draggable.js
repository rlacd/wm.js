/*
wm.js (C) acdra1n 2020. Licensed under GNU GPLv3.
*/

var dragTarget = null;
var mousePosRel = { x: 0, y: 0 };

window.addEventListener('load', ()=>{
    document.body.addEventListener('mouseup', function() {
        if(!dragTarget)
            return;
        
        const bounds = dragTarget.getBoundingClientRect();
        
        dragTarget.querySelectorAll("iframe").forEach((frame)=>{
            frame.style.pointerEvents = frame._drag_pointerEvents_og;
            delete frame._drag_pointerEvents_og;
        });

        dragTarget._drag.ondragend?.call(dragTarget._drag, dragTarget, { x: bounds.x + 'px', y: bounds.y + 'px' });
        dragTarget = null;
    });

    document.body.addEventListener('mousemove', function(e) {
        if(!dragTarget)
            return;
        
        const left = (e.x - mousePosRel.x) + "px";
        const top = (e.y - mousePosRel.y) + "px";

        dragTarget._drag.ondrag?.call(dragTarget._drag, dragTarget, { x: left, y: top });

        dragTarget.style.left = left;
        dragTarget.style.top = top;
    });
});

/**
 * Makes an element draggable.
 * @param {HTMLElement} element The element to make draggable.
 * @param {Object} opts The options to use to make an element draggable.
 */
export function draggable(element, opts) {
    if(opts == "destroy") {
        if(!element._drag)
            return;

        element.removeEventListener('mousedown', element._drag._evt_mousedown);
        delete element._drag;
        return;
    }

    if(element._drag)
        return;

    const options = {};

    Object.assign(options, {
        ondragstart: null,
        ondrag: null,
        ondragend: null,
        cancel: ""
    }, opts);

    options.cancel = options.cancel.split(',');

    options._evt_mousedown = function(e) {
        for(let i = 0; i < options.cancel.length; i++) {
            const selector = options.cancel[i];
            
            let parEl = e.target;
            while(parEl != null) {
                if(parEl.matches(selector))
                    return;
                
                parEl = parEl.parentElement;
            }
        }

        var rect = e.target.getBoundingClientRect();
        var rx = e.clientX - rect.left;
        var ry = e.clientY - rect.top;

        mousePosRel = {
            x: rx,
            y: ry
        }

        dragTarget = element;

        element.querySelectorAll("iframe").forEach((frame)=>{
            frame._drag_pointerEvents_og = frame.style.pointerEvents;
            frame.style.pointerEvents = "none";
        });

        options.ondragstart?.call(options, element, { rx: rx + "px", ry: ry + "px" });
    }

    element._drag = options;
    element.addEventListener('mousedown', options._evt_mousedown);
}