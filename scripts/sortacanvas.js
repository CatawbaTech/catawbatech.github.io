/*
SortaCanvas
Basic dynamic object-based system for using the <canvas>
Author: Titus
Jan 2021
*/

let SortaCanvas = function () {
  this.ready = false;
  this.strictMode = false;
  const scope = this;
  scope.init = (canvas, loop, tween) => {
    //Prep
    if (canvas != undefined) {
      scope.canvas = canvas;
      if (typeof document != "undefined") {
        scope.addEventListeners();
      }
      scope.ctx = canvas.getContext("2d");
      scope.objects = [];
      scope.ready = true;
      scope.physics = false;
      scope.strictMode = scope.strictMode;
      scope.logs = 0;
      scope.frames = 0;
      scope.clearRect = false;
      scope.scaleSize = 1;
      scope.background = "rgb(0,0,0)";
      scope.supportedEvents = [
        "mousedown",
        "mouseup",
        "mousemove",
        "mousedownhit",
        "mouseuphit",
        "mousemovehit",
        "collision",
        "wheel",
        "wheelhit",
      ];
      scope.TWEEN = tween != undefined ? tween : false;

      scope.loop = loop == true ? true : false;
      if (scope.loop == true) {
        scope.render();
      }
    } else {
      scope.error(
        "Missing canvas variable! Please pass in your <canvas> element into this function."
      );
    }
  };
  scope.setBackground = (color) => {
    if (typeof color == "string") {
      scope.background = color;
    } else {
      if (scope.strictMode == true) {
        scope.throwError("Input color must be a string.");
      }
    }
  };
  scope.doRender = (bool) => {
    scope.loop = typeof bool == "boolean" ? bool : false;
    if (bool == true) {
      scope.render();
    }
    if (typeof bool != "boolean" && scope.strictMode == true) {
      scope.error("doRender only accepts a boolean as its only argument.");
    }
  };
  scope.enableFullscreen = () => {
    scope.setSize(window.innerWidth, window.innerHeight);
    if (window) {
      window.addEventListener("resize", function () {
        scope.setSize(window.innerWidth, window.innerHeight);
      });
    } else {
      scope.warn("No window scope");
      if (scope.strictMode == true) {
        scope.throwError("Missing window scope.");
      }
    }
  };
  scope.setSize = (width, height) => {
    if (typeof height == "number" && typeof width == "number") {
      scope.canvas.height = height;
      scope.canvas.width = width;
    } else {
      if (scope.strictMode == true) {
        scope.throwError(
          "One or more variables are not of their expected types. (number)"
        );
      }
    }
  };

  scope.enableStrictMode = () => {
    scope.strictMode = true;
  };
  scope.disableStrictMode = () => {
    scope.strictMode = false;
  };
  scope.addEventListener = (event, fn) => {
    if (!scope.supportedEvents.includes(event) && scope.strictMode == true) {
      scope.warn("Added unsupported event.");
    }
    this[event] = fn;
  };
  scope.getBounds = (obj) => {
    return {
      min: {
        x: obj.x,
        y: obj.y,
      },
      max: {
        x: obj.width + obj.x,
        y: obj.height + obj.y,
      },
    };
  };
  scope.calculateSize = (obj) => {
    var ox = obj.x;
    var oy = obj.y;
    var width = obj.width;
    var height = obj.height;
    if (obj.type == "text") {
      oy -= height;
    }
    if (obj.type == "circle") {
      //Handle circle collisions
      //Since handling circle collisions is annoying, treat circle as a rectangle

      height = width = obj.radius * 2;
      ox -= obj.radius;
      oy -= obj.radius;
    }
    return {
      x: ox,
      y: oy,
      height,
      width,
    };
  };
  scope.collision = (obj, obj2) => {
    if (obj != undefined && obj2 != undefined) {
      let bounds = scope.getBounds(scope.calculateSize(obj));
      let bounds2 = scope.getBounds(scope.calculateSize(obj2));
      if (
        bounds.min.x < bounds2.max.x &&
        bounds.max.x > bounds2.min.x &&
        bounds.min.y < bounds2.max.y &&
        bounds.max.y > bounds2.min.y
      ) {
        return true; //Collide
      } else {
        return false; //No collision detected
      }
    }
  };
  scope.raycast = (x, y) => {
    for (var i = 0; i < scope.objects.length; i++) {
      var obj = scope.objects[i];
      if (obj.pick == undefined || obj.pick == true) {
        let bounds = scope.getBounds(scope.calculateSize(obj));
        if (
          x > bounds.min.x &&
          x < bounds.max.x &&
          y > bounds.min.y &&
          y < bounds.max.y
        ) {
          return obj;
        }
      }
    }
  };
  scope.calculateMousePos = (e) => {
    let bound = e.target.getBoundingClientRect();
    let canvasX = bound.left;
    let canvasY = bound.top + 32 - scope.camY;
    let x = e.clientX - canvasX;
    let y = e.clientY - canvasY;
    return { x: x, y: y };
  };
  scope.dispatch = (name, data) => {
    if (this[name] != undefined) {
      this[name](data);
    }
  };
  scope.mouseUpEvent = (e) => {
    if (e.target == scope.canvas) {
      var e2 = e.changedTouches != undefined ? e.changedTouches[0] : e;
      var pos = scope.calculateMousePos(e2);
      var obj = scope.raycast(pos.x, pos.y);
      if (obj != undefined) {
        //Hit an object.
        scope.dispatch("mouseup", {
          object: obj,
          pos: pos,
          event: e,
        });
      } else {
        scope.dispatch("mouseup", {
          pos: pos,
          event: e,
        });
      }
      //e.preventDefault();
    }
  };
  scope.wheelEvent = (e) => {
    if (e.target == scope.canvas) {
      var pos = scope.calculateMousePos(e);
      var obj = scope.raycast(pos.x, pos.y);
      if (obj != undefined) {
        scope.dispatch("wheelhit", {
          object: obj,
          pos: pos,
          event: e,
        });
      } else {
        scope.dispatch("wheel", {
          pos: pos,
          event: e,
        });
      }
    }
  };
  scope.contextMenuEvent = (e) => {
    if (e.target == scope.canvas) {
      var pos = scope.calculateMousePos(e);
      var obj = scope.raycast(pos.x, pos.y);
      if (obj != undefined) {
        scope.dispatch("contextmenuhit", {
          object: obj,
          pos: pos,
          event: e,
        });
      } else {
        scope.dispatch("contextmenu", {
          pos: pos,
          event: e,
        });
      }
      // e.preventDefault();
      e.stopPropagation(); //stop contextmenu
    }
  };
  scope.mouseMoveEvent = (e) => {
    if (e.target == scope.canvas) {
      var e2 = e.changedTouches != undefined ? e.changedTouches[0] : e;
      var pos = scope.calculateMousePos(e2);
      var obj = scope.raycast(pos.x, pos.y);
      if (obj != undefined) {
        scope.dispatch("mousemovehit", {
          object: obj,
          pos: pos,
          event: e,
        });
      } else {
        scope.dispatch("mousemove", {
          pos: pos,
          event: e,
        });
      }
      //  e.preventDefault();
    }
  };
  scope.mouseDownEvent = (e) => {
    if (e.target == scope.canvas) {
      let e2 = e.changedTouches != undefined ? e.changedTouches[0] : e;
      var pos = scope.calculateMousePos(e2);
      var obj = scope.raycast(pos.x, pos.y);
      if (obj != undefined) {
        scope.dispatch("mousedownhit", {
          object: obj,
          pos: pos,
          event: e,
        });
      } else {
        scope.dispatch("mousedown", {
          pos: pos,
          event: e,
        });
      }
      //e.preventDefault();
    }
  };
  scope.addEventListeners = () => {
    if (document) {
      document.body.addEventListener("mouseup", scope.mouseUpEvent);
      document.body.addEventListener("contextmenu", scope.contextMenuEvent);
      document.body.addEventListener("mousemove", scope.mouseMoveEvent);
      document.body.addEventListener("mousedown", scope.mouseDownEvent);
      document.body.addEventListener("touchstart", scope.mouseDownEvent);
      document.body.addEventListener("touchmove", scope.mouseMoveEvent);
      document.body.addEventListener("touchend", scope.mouseUpEvent);
      document.body.addEventListener("wheel", scope.wheelEvent);
    } else {
      if (scope.strictMode == true) {
        scope.throwError(
          "The window scope is unavailable. If you are using this library outside of the window scope, run the event functions manually. Pass them to mouseUpEvent, mouseMoveEvent, and mouseDownEvent."
        );
      } else {
        scope.error("Incorrect scope, cannot add listeners.");
      }
    }
  };

  scope.render = () => {
    if (scope.loop == true) {
      requestAnimationFrame(scope.render);
    }
    if (scope.TWEEN != false) {
      scope.TWEEN.update();
    }
    if (scope.clearRect == false) {
      scope.ctx.fillStyle = scope.background;
      scope.ctx.rect(0, 0, scope.canvas.width, scope.canvas.height);
      scope.ctx.fill();
    } else {
      scope.ctx.clearRect(0, 0, scope.canvas.width, scope.canvas.width);
    }
    if (scope.ready == true) {
      let ln = scope.objects.length;
      let lastDraw = [];
	  let lastestDraw = [];
      for (let i = 0; i < ln; i++) {
        if (scope.objects[i].visible == true) {
			if(scope.objects[i].drawLastest == undefined || scope.objects[i].drawLastest == false) {
          if (
            scope.objects[i].drawLast == undefined ||
            scope.objects[i].drawLast == false
          ) {
            scope.ctx.globalAlpha = scope.objects[i].opacity || 1;
            scope.objects[i].draw();
            scope.ctx.globalAlpha = 1;
          } else {
            lastDraw.push(scope.objects[i]);
          }
			} else {
				lastestDraw.push(scope.objects[i]);
			}
        }
      }
      if (lastDraw.length > 0) {
        for (let l = 0; l < lastDraw.length; l++) {
          scope.ctx.globalAlpha = lastDraw[l].opacity || 1;
          lastDraw[l].draw();
          scope.ctx.globalAlpha = 1;
        }
      }
	if(lastestDraw.length > 0) {
		for (let l = 0; l < lastestDraw.length; l++) {
          scope.ctx.globalAlpha = lastestDraw[l].opacity || 1;
          lastestDraw[l].draw();
          scope.ctx.globalAlpha = 1;
        }
	}
    }
    scope.frames++;
  };
  scope.scale = (size) => {
    // "Scale" all objects.
    if (size > 0) {
      scope.scaleSize = size;
      for (let i = 0; i < scope.objects.length; i++) {
        // scale
        let obj = scope.objects[i];
        if (!obj.orgX) obj.orgX = obj.x;
        if (!obj.orgY) obj.orgY = obj.y;
        if (obj.height && obj.width && !obj.orgWidth && !obj.orgHeight) {
          obj.orgWidth = obj.width;
          obj.orgHeight = obj.height;
        }
        if (obj.radius && !obj.orgRadius) obj.orgRadius = obj.radius;
        obj.x = obj.orgX * size;
        obj.y = obj.orgY * size;
        if (obj.height && obj.width)
          (obj.height = obj.orgHeight * size),
            (obj.width = obj.orgWidth * size);
        if (obj.radius) obj.radius = obj.orgRadius * size;
      }
      // Applied on next render.
    } else {
      scope.throwError("Scale size must be a number and bigger than 0.");
    }
  };
  scope.Move = (obj, x2, y2, time) => {
    if (scope.tween != false) {
      let fr = { x: obj.x, y: obj.y };
      let to = {
        x: typeof x2 == "number" ? x2 : 0,
        y: typeof y2 == "number" ? y2 : 0,
      };
      let tween = new scope.TWEEN.Tween(fr)
        .to(to, time * 1000)
        .onUpdate(function () {
          obj.x = fr.x;
          obj.y = fr.y;
        })
        .start();
      return tween;

      if (
        typeof x2 != "number" ||
        typeof y2 != "number" ||
        typeof time != "number"
      ) {
        if (scope.strictMode == true) {
          scope.throwError(
            "One or more arguments were not of their expected types (number)"
          );
        }
      }
    } else {
      if (scope.strictMode == false) {
        scope.warn("Animation is disabled, using fallback.");
        obj.x = x2;
        obj.y = y2;
      } else {
        scope.throwError("Animation is disabled.");
      }
    }
  };
  scope.Rotate = (obj, rot, time) => {
    if (typeof rot != "number" || typeof time != "number") {
      rot = 0;
      time = 0;
      scope.throwError(
        "One or more variables are not of their expected types (number)."
      );
      return false;
    }
    let fr = { rot: obj.rotation };
    let to = { rot: rot };
    let tween = new scope.TWEEN.Tween(fr)
      .to(to, time * 1000)
      .onUpdate(function () {
        obj.rotation = fr.rot;
      })
      .start();
    return tween;
  };
  scope.Line = function (pts, lw, ss, n) {
    if (!pts[0]) throw new Error("Points must be an array.");
    //  if (pts[0].x == undefined || pts[0].y == undefined || pts[0].toX == undefined || pts[0].toY == undefined) throw new Error('Must have .x, .y, .toX, .toY to create at least one line.');
    this.x = typeof pts[0].x == "number" ? pts[0].x : 0;
    this.y = typeof pts[0].y == "number" ? pts[0].y : 0;
    this.height = 0; // filler to prevent bugs
    this.width = 0;
    this.name = n;
    this.points = pts;
    this.strokeStyle = ss;
    this.lineWidth = typeof lw == "number" ? lw : 0;
    this.visible = true;
    if (typeof lw != "number") throw new Error("Line width must be a number.");
    this.rotation = 0;
    this.type = "line";
    this.draw = function () {
      if (this.rotation != 0) {
        console.warn("this: Rotating lines is unsupported!");
      }
      scope.ctx.beginPath();
      scope.ctx.strokeStyle = this.strokeStyle;
      scope.ctx.lineWidth = this.lineWidth;
      if (typeof this.lineWidth != "number")
        console.warn("make sure linewidth is a number");
      scope.ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < pts.length; i++) {
        if (pts[i].toX != undefined && pts[i].toY != undefined) {
          scope.ctx.moveTo(pts[i].x, pts[i].y);
          scope.ctx.lineTo(pts[i].toX, pts[i].toY);
        } else {
          if (pts[i + 1]) {
            scope.ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
          }
        }
        scope.ctx.stroke();
      }
      scope.ctx.closePath();
    };
  };
  this.Rectangle = function (x, y, h, w, c, n) {
    this.x = typeof x == "number" ? x : 0;
    this.y = typeof y == "number" ? y : 0;
    this.height = typeof h == "number" && h >= 0 ? h : 0;
    this.width = typeof w == "number" && w >= 0 ? w : 0;
    this.color = typeof c == "string" ? c : "black";
    this.name = n;
    this.visible = true;
    this.rotation = 0;
    this.type = "rectangle";
    if (
      typeof x != "number" ||
      typeof y != "number" ||
      typeof h != "number" ||
      typeof w != "number" ||
      typeof c != "string" ||
      h < 0 ||
      w < 0
    ) {
      if (this.strictMode == true) {
        scope.throwError(
          "One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative."
        );
      }
    }
    this.draw = function () {
      if (
        typeof this.x != "number" ||
        typeof this.y != "number" ||
        typeof this.height != "number" ||
        typeof this.width != "number" ||
        typeof this.color != "string" ||
        this.height < 0 ||
        this.width < 0 ||
        typeof this.rotation != "number"
      ) {
        scope.throwError(
          "One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative."
        );
      } else {
        if (this.rotation != 0) {
          scope.ctx.save();
          scope.ctx.translate(
            this.x + this.width / 2,
            this.y + this.height / 2
          );
        }
        scope.ctx.rotate((this.rotation * Math.PI) / 180);
        scope.ctx.beginPath();
        scope.ctx.fillStyle = this.color;
        if (this.rotation != 0) {
          scope.ctx.rect(
            0 - this.width / 2,
            0 - this.height / 2,
            this.width,
            this.height
          );
        } else {
          scope.ctx.rect(this.x, this.y, this.width, this.height);
        }
        scope.ctx.fill();
        scope.ctx.closePath();
        if (this.rotation != 0) {
          scope.ctx.restore();
        }
      }
    };
  };
  this.Circle = function (x, y, r, c, n) {
    this.x = typeof x == "number" ? x : 0;
    this.y = typeof y == "number" ? y : 0;
    this.radius = typeof r == "number" && r >= 0 ? r : 0;
    this.color = typeof c == "string" ? c : "black";
    this.name = n;
    this.visible = true;
    this.type = "circle";
    if (
      typeof x != "number" ||
      typeof y != "number" ||
      typeof r != "number" ||
      typeof c != "string" ||
      r < 0
    ) {
      if (this.strictMode == true) {
        scope.throwError(
          "One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative."
        );
      }
    }
    this.draw = function () {
      if (
        typeof this.x != "number" ||
        typeof this.y != "number" ||
        typeof this.color != "string" ||
        typeof this.radius != "number" ||
        this.radius < 0
      ) {
        scope.throwError(
          "One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative."
        );
      } else {
        scope.ctx.fillStyle = this.color;
        scope.ctx.beginPath();
        scope.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        scope.ctx.fill();
        scope.ctx.closePath();
      }
    };
  };
  this.Image = function (x, y, h, w, s, n) {
    this.x = typeof x == "number" ? x : 0;
    this.y = typeof y == "number" ? y : 0;
    this.height = typeof h == "number" && h >= 0 ? h : 0;
    this.width = typeof w == "number" && w >= 0 ? w : 0;
    this.img = typeof Image != "undefined" ? new Image() : undefined; //no caps
    this.visible = true;
    if (this.img != undefined) {
      this.img.src = typeof s == "string" ? s : "";
    } else {
      //Image is undefined. Use fetch() to load image
      let imge = undefined;
      let response = fetch(s)
        .then((response) => response.blob())
        .then((blob) => {
          createImageBitmap(blob, 0, 0, w, h).then(function (i) {
            imge = i;
          });
        });
      let parent = this;
      function lazyLoop() {
        if (imge != undefined) {
          parent.img = imge;
          if (parent.onload != undefined) {
            parent.onload(parent.img);
          }
          clearInterval(itv);
        }
      }
      let itv = setInterval(lazyLoop);
    }
    this.name = n;
    this.type = "image";
    this.loaded = false;
    this.rotation = 0;
    if (
      typeof x != "number" ||
      typeof y != "number" ||
      typeof h != "number" ||
      typeof w != "number" ||
      typeof s != "string" ||
      h < 0 ||
      w < 0
    ) {
      if (this.strictMode == true) {
        scope.throwError(
          "One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative."
        );
      }
    }
    if (this.img != undefined) {
      this.img.onload = function () {
        this.loaded = true; //If the user may wish to debug or check when the image is loaded
      };
    }
    this.draw = function () {
      if (
        typeof this.x != "number" ||
        typeof this.y != "number" ||
        typeof this.height != "number" ||
        typeof this.width != "number" ||
        this.height < 0 ||
        this.width < 0 ||
        typeof this.rotation != "number"
      ) {
        scope.throwError(
          "One or more variables are not of their expected types, or are undefined. This error will also be thrown if any arguments are negative."
        );
      } else {
        if (this.img != undefined) {
          if (this.rotation != 0) {
            scope.ctx.save();
            scope.ctx.translate(
              this.x + this.width / 2,
              this.y + this.height / 2
            );
          }
          scope.ctx.rotate((this.rotation * Math.PI) / 180);
          if (this.rotation != 0) {
            scope.ctx.drawImage(
              this.img,
              -this.width / 2,
              -this.height / 2,
              this.width,
              this.height
            );
            scope.ctx.restore();
          } else {
            scope.ctx.drawImage(
              this.img,
              this.x,
              this.y,
              this.width,
              this.height
            );
          }
        }
      }
    };
  };
  this.Text = function (x, y, t, font, s, str, n) {
    this.font = typeof font == "string" ? font : "20px Arial";
    this.x = typeof x == "number" ? x : 0;
    this.y = typeof y == "number" ? y : 0;
    this.text = typeof t == "string" ? t : "Missing text!";
    this.type = "text";
    this.style = typeof s == "string" ? s : "red";
    this.color = this.style;
    this.stroke = typeof str == "boolean" ? str : false;
    this.name = n;
    this.visible = true;
    this.rotation = 0;
    if (
      typeof font != "string" ||
      typeof x != "number" ||
      typeof y != "number" ||
      typeof t != "string" ||
      typeof s != "string" ||
      typeof str != "boolean"
    ) {
      if (this.strictMode == true) {
        scope.throwError(
          "One or more variables are not of their expected types, or are undefined. This error will also be thrown if any values are negative."
        );
      }
    }
    this.width = scope.ctx.measureText(this.text).width;
    this.updateWidth = () => {
      scope.ctx.font = this.font;
      this.style = this.color;
      scope.ctx.fillStyle = this.style;
      this.width = scope.ctx.measureText(this.text).width;
    };
    this.updateWidth();
    this.height = Number(this.font.replace(/\D/g, ""));
    this.draw = function () {
      if (
        typeof this.font != "string" ||
        typeof this.x != "number" ||
        typeof this.y != "number" ||
        typeof this.text != "string" ||
        typeof this.style != "string" ||
        typeof this.stroke != "boolean" ||
        typeof this.rotation != "number"
      ) {
        scope.throwError(
          "One or more variables are not of their expected types, or are undefined. This error will also be thrown if any values are negative."
        );
      } else {
        scope.ctx.font = this.font; //Font: "30px Arial"
        this.style = this.color;
        scope.ctx.fillStyle = this.style; //Style: "green"
        this.width = scope.ctx.measureText(this.text).width;
        this.height = Number(this.font.split("px ")[0]);
        if (typeof this.strokeStyle == "string") {
          this.strokeStyle = this.strokeStyle;
        }
        if (this.rotation != 0) {
          scope.ctx.save();
          scope.ctx.translate(
            this.x + this.width / 2,
            this.y + this.height / 2
          );
          scope.ctx.rotate((this.rotation * Math.PI) / 180);
        }
        if (this.rotation == 0) {
          scope.ctx.fillText(this.text, this.x, this.y);
          if (this.stroke == true) {
            scope.ctx.strokeText(this.text, this.x, this.y);
          }
        } else {
          scope.ctx.fillText(this.text, -this.width / 2, -this.height / 2);
          if (this.stroke == true) {
            scope.ctx.strokeText(this.text, -this.width / 2, -this.height / 2);
          }
          scope.ctx.restore();
        }
      }
    };
  };
  this.add = (obj) => {
    this.objects.push(obj);
  };
  this.remove = (obj) => {
    try {
      this.objects.splice(this.objects.indexOf(obj), 1);
    } catch (err) {
      this.error("Unable to remove object. Error reported: " + err);
    }
  };
  this.getObjectByName = (n) => {
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].name == n) return this.objects[i];
    }
    return undefined;
  };
  this.distanceTo = (a, b) => {
    return Math.sqrt(((b.x - a.x) ^ 2) + ((b.y - a.y) ^ 2));
  };
  this.log = (t) => {
    if (this.logs < 1000) {
      console.log("SortaCanvas: " + t);
      this.logs++;
      return t;
    } else {
      if (this.logs < 1001) {
        this.logs++;
        console.warn(
          "SortaCanvas exceeded 1000 logs/warnings/errors. Reports will cease."
        );
      }
    }
  };
  this.warn = (t) => {
    if (this.logs < 1000) {
      if (this.strictMode == false) {
        console.warn("SortaCanvas: " + t);
      } else {
        console.warn("SortaCanvas (strict): " + t);
      }
      this.logs++;
      return t;
    } else {
      if (this.logs < 1001) {
        this.logs++;
        console.warn(
          "SortaCanvas exceeded 1000 logs/warnings/errors. Reports will cease."
        );
      }
    }
  };
  this.error = (t) => {
    if (this.logs < 1000) {
      if (this.strictMode == false) {
        console.error("SortaCanvas: " + t);
      } else {
        console.error("SortaCanvas (strict): " + t);
      }
      this.logs++;
      return t;
    } else {
      if (this.logs < 1001) {
        this.logs++;
        console.warn(
          "SortaCanvas exceeded 1000 logs/warnings/errors. Reports will cease."
        );
      }
    }
  };
  this.throwError = (err) => {
    if (this.logs < 1000) {
      this.logs++;
      class SortaCanvasError extends Error {
        constructor(message, ...args) {
          super(message, ...args);
          this.name = "SortaCanvasLib_Error";
          this.message = message;
        }
      }
      throw new SortaCanvasError(err);
    } else {
      if (this.logs < 1001) {
        this.logs++;
        console.warn(
          "SortaCanvas exceeded 1000 logs/warnings/errors. Reports will cease."
        );
      }
    }
  };
  this.randomColor = () => {
    return (
      "rgb(" +
      Math.random() * 255 +
      "," +
      Math.random() * 255 +
      "," +
      Math.random() * 255 +
      ")"
    );
  };
};

//Export module
export default SortaCanvas;
