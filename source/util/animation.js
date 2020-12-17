/*
wm.js (C) acdra1n 2020. Licensed under GNU GPLv3.
*/

/**
 * Animates an element.
 * @param {HTMLElement} element The element to animate.
 * @param {String} animation The name of the animation.
 */
export function animate(element, animation) {
    return new Promise((resolve) => {
        const node = (element instanceof HTMLElement) ? element : document.querySelector(element);
    
        node.classList.add(animation);
    
        node.addEventListener('animationend', ()=>{
            node.classList.remove(animation);
            resolve();
        }, { once: true });
    });
}