import {objAnim} from './objAnim'

lottie.loadAnimation({
  container: document.querySelectorAll(".icon")[0], // the dom element that will contain the animation
  renderer: 'svg',
  loop: true,
  autoplay: true,
  animationData: objAnim
  // path: 'data/11649-loading.json' // the path to the animation json
});
