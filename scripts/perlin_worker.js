/* 
Perlin Noise Map Generator
Asynchronously collects smooth noise in 2D arrays
Author: Titus
11/14/2024
*/
import promise, { noise_3D } from "./perlin.js";

(async () => {
  await promise;

  const divi = 7;
  const divi2 = 4;
  const divi3 = 4;

  onmessage = ({ data }) => {
    if (data[0] == "gen") {
      const [, minX, minY, maxX, maxY] = data;
      const arr = [];

      for (let x = minX; x < maxX; x++) {
        let xArr = [];
        for (let y = minY; y < maxY; y++) {
          xArr.push([
            noise_3D(x / divi, y / divi, 0),
            noise_3D(y / divi2, x / divi2, 0),
			noise_3D(-y / divi3, x / divi3, 0),
          ]);
        }
        arr.push(xArr);
      }
      globalThis.postMessage(["map", arr]);
    }
  };
  globalThis.postMessage(null);
})();
