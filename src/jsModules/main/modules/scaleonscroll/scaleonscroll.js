
let zoomMap = zoom("#map"),
    x = 0,
    y = 0,
    z = 1;


let unpanzoom = zoom(document.querySelectorAll(".map")[0], e => {
  // e contains all the params related to the interaction
  if (e.srcElement === document.querySelectorAll(".map")[0]) {
      x = x + e.dx;
      y = y + e.dy;
      z = z + e.dz / 1000;


      e.srcElement.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${z})`
  }
  // pan deltas
  e.dx;
  e.dy;

  // zoom delta
  e.dz;

  // coordinates of the center
  e.x;
  e.y;

  // type of interaction: mouse, touch, keyboard
  e.type;

  // target element event is applied to
  e.target;

  // original element event started from
  e.srcElement;

  // initial coordinates of interaction
  e.x0;
  e.y0;



});

console.log(unpanzoom);
