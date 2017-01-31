let holder,
    dragCardWrapper,
    dragCard, 
    dragStartX, 
    dragStartY, 
    offsetX, 
    offsetY;

let initialized = false;

init();

export function layerBeginDragging(boundingRect, text, color) {
  if (!holder)
    init();

  dragCardWrapper.style.width = (boundingRect.width) + "px";

  dragCard.textContent = text;
  dragCard.style.backgroundColor = color;

  offsetX = dragStartX - boundingRect.left;
  offsetY = dragStartY - boundingRect.top;

  let transform = `translate(${boundingRect.left}px, ${boundingRect.top}px)`;
  dragCardWrapper.style.transform = transform;

  holder.appendChild(dragCardWrapper);
  document.addEventListener('dragover', handleDragging);
}

export function layerEndDragging() {
  holder.removeChild(dragCardWrapper);
  document.removeEventListener('dragover', handleDragging);
}

export function init() {
  if (initialized) return;

  console.log('init');

  document.ondragstart = (e) => {
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  }

  holder = document.createElement("div");
  holder.className = "drag-layer";
  document.body.appendChild(holder);

  dragCardWrapper = document.createElement("div");
  dragCardWrapper.className = "card-drag-preview__wrapper";
  dragCard = document.createElement("div");
  dragCard.className = "card-drag-preview";
  dragCardWrapper.appendChild(dragCard);

  initialized = true;
}

function handleDragging(e) {
  let transform = `translate(${e.clientX - offsetX}px, ${e.clientY - offsetY}px)`;
  dragCardWrapper.style.transform = transform;
}

