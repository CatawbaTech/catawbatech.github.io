/* 
Not made by me:
This code is adapted from online content that I don't understand, but it works!
*/
export let noise_2D, noise_3D, noise_4D;

export default (async function init() {
  const { instance } = await WebAssembly.instantiateStreaming(
    fetch("/scripts/perlin_wasm.wasm")
  );

  ({ noise_2D, noise_3D, noise_4D } = instance.exports);
})();
