(() => {
	"use strict";

	const CANVAS_ELEMENT = "canvas";
	const CONTEXT = "2d";
	const DEFAULT_FRAME_TIME = 16;

	const Axis = makeEnum([
		"LEFT_X",
		"LEFT_Y",
		"RIGHT_X",
		"RIGHT_Y",
	]);

	const ButtonLayout = {
		reversed: makeEnum([
			"B",
			"A",
			"Y",
			"X",
			"L1",
			"R1",
			"L2",
			"R2",
			"SELECT",
			"START",
			"L3",
			"R3",
			"UP",
			"DOWN",
			"LEFT",
			"RIGHT",
		]),

		standard: makeEnum([
			"A",
			"B",
			"X",
			"Y",
			"L1",
			"R1",
			"L2",
			"R2",
			"SELECT",
			"START",
			"L3",
			"R3",
			"UP",
			"DOWN",
			"LEFT",
			"RIGHT",
		])
	};

	const ButtonLayoutMap = {
		"8bitdo s": "reversed"
	};

	const Color = makeHash([
		"AliceBlue",
		"AntiqueWhite",
		"Aqua",
		"Aquamarine",
		"Azure",
		"Beige",
		"Bisque",
		"Black",
		"BlanchedAlmond",
		"Blue",
		"BlueViolet",
		"Brown",
		"BurlyWood",
		"CadetBlue",
		"Chartreuse",
		"Chocolate",
		"Coral",
		"CornflowerBlue",
		"Cornsilk",
		"Crimson",
		"Cyan",
		"DarkBlue",
		"DarkCyan",
		"DarkGoldenRod",
		"DarkGray",
		"DarkGreen",
		"DarkGrey",
		"DarkKhaki",
		"DarkMagenta",
		"DarkOliveGreen",
		"Darkorange",
		"DarkOrchid",
		"DarkRed",
		"DarkSalmon",
		"DarkSeaGreen",
		"DarkSlateBlue",
		"DarkSlateGray",
		"DarkSlateGrey",
		"DarkTurquoise",
		"DarkViolet",
		"DeepPink",
		"DeepSkyBlue",
		"DimGray",
		"DimGrey",
		"DodgerBlue",
		"FireBrick",
		"FloralWhite",
		"ForestGreen",
		"Fuchsia",
		"Gainsboro",
		"GhostWhite",
		"Gold",
		"GoldenRod",
		"Gray",
		"Green",
		"GreenYellow",
		"Grey",
		"HoneyDew",
		"HotPink",
		"IndianRed",
		"Indigo",
		"Ivory",
		"Khaki",
		"Lavender",
		"LavenderBlush",
		"LawnGreen",
		"LemonChiffon",
		"LightBlue",
		"LightCoral",
		"LightCyan",
		"LightGoldenRodYellow",
		"LightGray",
		"LightGreen",
		"LightGrey",
		"LightPink",
		"LightSalmon",
		"LightSeaGreen",
		"LightSkyBlue",
		"LightSlateGray",
		"LightSlateGrey",
		"LightSteelBlue",
		"LightYellow",
		"Lime",
		"LimeGreen",
		"Linen",
		"Magenta",
		"Maroon",
		"MediumAquaMarine",
		"MediumBlue",
		"MediumOrchid",
		"MediumPurple",
		"MediumSeaGreen",
		"MediumSlateBlue",
		"MediumSpringGreen",
		"MediumTurquoise",
		"MediumVioletRed",
		"MidnightBlue",
		"MintCream",
		"MistyRose",
		"Moccasin",
		"NavajoWhite",
		"Navy",
		"OldLace",
		"Olive",
		"OliveDrab",
		"Orange",
		"OrangeRed",
		"Orchid",
		"PaleGoldenRod",
		"PaleGreen",
		"PaleTurquoise",
		"PaleVioletRed",
		"PapayaWhip",
		"PeachPuff",
		"Peru",
		"Pink",
		"Plum",
		"PowderBlue",
		"Purple",
		"RebeccaPurple",
		"Red",
		"RosyBrown",
		"RoyalBlue",
		"SaddleBrown",
		"Salmon",
		"SandyBrown",
		"SeaGreen",
		"SeaShell",
		"Sienna",
		"Silver",
		"SkyBlue",
		"SlateBlue",
		"SlateGray",
		"SlateGrey",
		"Snow",
		"SpringGreen",
		"SteelBlue",
		"Tan",
		"Teal",
		"Thistle",
		"Tomato",
		"Turquoise",
		"Violet",
		"Wheat",
		"White",
		"WhiteSmoke",
		"Yellow",
		"YellowGreen",
	]);

	const Command = makeEnum([
		"UP",
		"DOWN",
		"LEFT",
		"RIGHT",
		"A",
		"B",
		"X",
		"Y",
		"SELECT",
		"START",
	]);

	const CompositeOperations = {
		COPY: "copy",
		DESTINATION_ATOP: "destination-atop",
		DESTINATION_IN: "destination-in",
		DESTINATION_OUT: "destination-out",
		DESTINATION_OVER: "destination-over",
		LIGHTER: "lighter",
		SOURCE_ATOP: "source-atop",
		SOURCE_IN: "source-in",
		SOURCE_OUT: "source-out",
		SOURCE_OVER: "source-over",
		XOR: "xor",
	};

	const FontFamily = {
		Cursive: "cursive",
		Fantasy: "fantasy",
		Monospace: "monospace",
		SansSerif: "sans-serif",
		Serif: "serif",
	};

	const Key = {
		BACK: 8,
		ENTER: 13,
		SHIFT: 16,
		CTRL: 17,
		ALT: 18,
		SPACE: 32,
		LEFT: 65,
		UP: 87,
		RIGHT: 68,
		DOWN: 83,
		D: 68,
		E: 69,
		F: 70,
		I: 73,
		J: 74,
		K: 75,
		L: 76,
		S: 88
	};

	class Animation {
		constructor(frames) {
			this._frames = frames;
			this._index = 0;
			this._tick = 0;
		}

		static fromImages(images, duration) {
			return new this(images.map(image => new Frame(image, duration)));
		}

		get image() {
			return this._frames[this._index].image;
		}

		get width() {
			return this._frames[this._index].width;
		}

		get height() {
			return this._frames[this._index].height;
		}

		setFrameIndex(index) {
			if (index < this._frames.length) {
				this._index = index;
				this._tick = 0;
			}
		}

		set frameIndex(index) {
			this.setFrameIndex(index);
		}

		sync() {
			const DURATION = this._frames[this._index].duration;
			let hasLooped = false;

			if (DURATION && ++this._tick >= DURATION) {
				let index = this._index + 1;

				if (index == this._frames.length) {
					hasLooped = true;
					index = 0;
				}

				this.setFrameIndex(index);
			}

			return hasLooped;
		}
	}

	class Controller {
		constructor() {
			this.tolerance = 0;
			this._active = {};
			this._device = null;
			this._hold = {};
			this._sequence = [];
			this._tick = 0;
		}

		didPerform(commands) {
			for (let i = 1; i <= commands.length; ++i) {
				if (this._sequence[this._sequence.length - i] != commands[commands.length - i]) {
					return false;
				}
			}

			this._sequence = [];
			return true;
		}

		keyDown(command) {
			return this._active[command];
		}

		keyPush(command) {
			return this._active[command] && !this._hold[command];
		}

		setDevice(device) {
			this._device = device;
		}

		update() {
			if (!this._device) {
				return;
			}

			this._hold = {};
			const LAST = this._active;
			this._active = this._device.commands;

			for (let i in this._active) {
				if (LAST[i]) {
					this._hold[i] = true;
				}
			}

			if (this.tolerance && ++this._tick > this.tolerance) {
				this._sequence = [];
				this._tick = 0;
			}

			for (let i in Command) {
				const COMMAND = Command[i];

				if (this.keyPush(COMMAND)) {
					this._sequence.push(COMMAND);
					this._tick = 0;
				}
			}
		}
	}

	class Core2D {
		static init(scene) {
			Engine.init(scene);
		}

		static get everyOther() {
			return Engine.everyOther;
		}

		static addControllerDevice(device) {
			Engine.addControllerDevice(device);
		}

		static clear() {
			Engine.clear();
		}

		static colorize(image, fillStyle) {
			return Engine.colorize(image, fillStyle);
		}

		static fadeOut() {
			Engine.fadeOut();
		}

		static flip(id) {
			return Engine.flip(id);
		}

		static getController(id) {
			return Engine.getController(id);
		}

		static getPointer(id) {
			return Engine.getPointer(id);
		}

		static image(id, isMirror, isFlip) {
			return Engine.image(id, isMirror, isFlip);
		}

		static load(namespace) {
			return Engine.load(namespace);
		}

		static mirror(id) {
			return Engine.mirror(id);
		}

		static mute() {
			Engine.mute();
		}

		static paint(renderable, index) {
			Engine.paint(renderable, index);
		}

		static play(id) {
			Engine.play(id);
		}

		static playTheme(name) {
			Engine.playTheme(name);
		}

		static random(max) {
			return Engine.random(max);
		}

		static rotate(image, degrees) {
			return Engine.rotate(image, degrees);
		}

		static save(data, namespace) {
			Engine.save(data, namespace);
		}

		static setAutoScale(autoScale) {
			Engine.setAutoScale(autoScale);
		}

		static setFrameTime(frameTime) {
			Engine.setFrameTime(frameTime);
		}

		static setKeepAspect(keepAspect) {
			Engine.setKeepAspect(keepAspect);
		}

		static setName(name) {
			Engine.setName(name);
		}

		static stopTheme() {
			Engine.stopTheme();
		}

		// factories
		static animation(frames) {
			return new Animation(frames);
		}

		static frame(image, duration) {
			return new Frame(image, duration);
		}

		static point(x, y) {
			return new Point(x, y);
		}

		static rect(x, y, width, height) {
			return new Rect(x, y, width, height);
		}

		static scene() {
			return new Scene();
		}

		static sprite(scene) {
			return new Sprite(scene);
		}
	}

	class Direction {
		constructor() {
			this.bottom = false;
			this.left = false;
			this.right = false;
			this.top = false;
		}

		setBottom(isBottom = true) {
			this.bottom = isBottom;
			return this;
		}

		setLeft(isLeft = true) {
			this.left = isLeft;
			return this;
		}

		setRight(isRight = true) {
			this.right = isRight;
			return this;
		}

		setTop(isTop = true) {
			this.top = isTop;
			return this;
		}
	}

	class Frame {
		constructor(image, duration = 0) {
			this._image = getImage(image);
			this._duration = duration;
		}

		get image() {
			return this._image;
		}

		get duration() {
			return this._duration;
		}

		get width() {
			return this._image.width;
		}

		get height() {
			return this._image.height;
		}
	}

	class GamePad {
		constructor(id = 0) {
			this._id = id;
			this.analogThreshold = 0.5;
			this.layout = ButtonLayout.standard;
			const MODEL = getGamepads()[id].id.toLowerCase();

			for (let id in ButtonLayoutMap) {
				if (MODEL.includes(id)) {
					this.layout = ButtonLayout[ButtonLayoutMap[id]];
				}
			}
		}

		get commands() {
			const BUTTONS = Input.getGamePadButtons(this._id);
			const RESULT = {};

			if (Input.getGamePadAxes(this._id)[Axis.LEFT_Y] < - this.analogThreshold) {
				RESULT[Command.UP] = true;
			} else if (Input.getGamePadAxes(this._id)[Axis.LEFT_Y] > this.analogThreshold) {
				RESULT[Command.DOWN] = true;
			}

			if (Input.getGamePadAxes(this._id)[Axis.LEFT_X] < - this.analogThreshold) {
				RESULT[Command.LEFT] = true;
			} else if (Input.getGamePadAxes(this._id)[Axis.LEFT_X] > this.analogThreshold) {
				RESULT[Command.RIGHT] = true;
			}

			for (let i in Command) {
				const BUTTON = BUTTONS[this.layout[i]];

				if (BUTTON && BUTTON.pressed) {
					RESULT[Command[i]] = true;
				}
			}

			return RESULT;
		}
	}

	class Input {
		constructor() {
			this._controllers = [];
			this._controllerQueue = [];
			this._controllerRequestQueue = [];
			this._pointers = [];
			this._pointerQueue = [];
			this._pointerRequestQueue = [];
			this._gamePads = 0;

			const ON_KEYBOARD = (event) => {
				removeEventListener("keydown", ON_KEYBOARD);
				console.log("Keyboard detected.");
				this.addController(new Keyboard(event));
			};

			const ON_MOUSE = (event) => {
				removeEventListener("mousemove", ON_MOUSE);
				console.log("Mouse detected.");
				this.addPointer(new Mouse(event));
			};

			const ON_TOUCH = (event) => {
				removeEventListener("touchstart", ON_TOUCH);
				console.log("Touch detected.");
				this.addPointer(new Touch(event));
			};

			addEventListener("keydown", ON_KEYBOARD, false);
			addEventListener("mousemove", ON_MOUSE, false);
			addEventListener("touchstart", ON_TOUCH, false);
		}

		static getGamePadAxes(id) {
			if (getGamepads()[id]) {
				return getGamepads()[id].axes;
			}

			return [];
		}

		static getGamePadButtons(id) {
			const GAMEPAD = getGamepads()[id];
			return GAMEPAD && GAMEPAD.buttons || [];
		}

		addController(device) {
			this._controllerQueue.push(device);
			this.checkControllerQueues();
		}

		addPointer(device) {
			this._pointerQueue.push(device);
			this.checkPointerQueues();
		}

		checkGamePads() {
			if (getGamepads()[this._gamePads]) {
				console.log("Game pad detected.");
				this.addController(new GamePad(this._gamePads++));
			}
		}

		checkControllerQueues() {
			if (this._controllerRequestQueue.length > 0 && this._controllerQueue.length > 0) {
				const REQUESTER = this._controllerRequestQueue.shift();
				const DEVICE = this._controllerQueue.shift();
				REQUESTER.setDevice(DEVICE);
			}
		}

		checkPointerQueues() {
			if (this._pointerRequestQueue.length > 0 && this._pointerQueue.length > 0) {
				const REQUESTER = this._pointerRequestQueue.shift();
				const DEVICE = this._pointerQueue.shift();
				REQUESTER.setDevice(DEVICE);
			}
		}

		getController(id = 0) {
			if (this._controllers.length < id + 1) {
				const CONTROLLER = new Controller();
				this._controllers.push(CONTROLLER);
				this._controllerRequestQueue.push(CONTROLLER);
				this.checkControllerQueues();
			}

			return this._controllers[id];
		}

		getPointer(id = 0) {
			if (this._pointers.length < id + 1) {
				const POINTER = new Pointer();
				this._pointers.push(POINTER);
				this._pointerRequestQueue.push(POINTER);
				this.checkPointerQueues();
			}

			return this._pointers[id];
		}

		update() {
			this.checkGamePads();

			for (let i in this._controllers) {
				this._controllers[i].update();
			}

			for (let j in this._pointers) {
				this._pointers[j].update();
			}
		}
	}

	class Keyboard {
		constructor(event) {
			this._buffer = {};

			this.keyToCommandMap = {
				[Key.UP]: Command.UP,
				[Key.E]: Command.UP,
				[Key.I]: Command.UP,
				[Key.DOWN]: Command.DOWN,
				[Key.D]: Command.DOWN,
				[Key.K]: Command.DOWN,
				[Key.LEFT]: Command.LEFT,
				[Key.S]: Command.LEFT,
				[Key.J]: Command.LEFT,
				[Key.RIGHT]: Command.RIGHT,
				[Key.F]: Command.RIGHT,
				[Key.L]: Command.RIGHT,
				[Key.SPACE]: Command.A,
				[Key.ALT]: Command.B,
				[Key.CTRL]: Command.X,
				[Key.SHIFT]: Command.Y,
				[Key.ENTER]: Command.START,
				[Key.BACK]: Command.SELECT,
			};

			this.onKey(event, true);
			addEventListener("keydown", event => this.onKey(event, true), false);
			addEventListener("keyup", event => this.onKey(event, false), false);
		}

		get commands() {
			const RESULT = {};

			for (let i in this._buffer) {
				if (this._buffer[i]) {
					RESULT[i] = true;
				}
			}

			return RESULT;
		}

		onKey(event, isDown) {
			const COMMAND = this.keyToCommandMap[event.keyCode];
			this._buffer[COMMAND] = isDown;

			if (isDown && "number" == typeof(COMMAND)) {
				event.preventDefault();
			}
		}
	}

	class Point {
		constructor(x = 0, y = 0) {
			this.x = x;
			this.y = y;
		}

		setX(x) {
			this.x = x;
			return this;
		}

		setY(y) {
			this.y = y;
			return this;
		}

		setPosition(point) {
			this.x = point.x;
			this.y = point.y;
			return this;
		}

		set position(point) {
			this.setPosition(point);
		}
	}

	class Pointer extends Point {
		constructor() {
			super();
			this._active = false;
			this._device = null;
			this._hold = false;
		}

		get down() {
			return this._active;
		}

		get push() {
			return this._active && !this._hold;
		}

		setDevice(device) {
			this._device = device;
		}

		update() {
			if (!this._device) {
				return;
			}

			this._hold = false;
			const LAST = this._active;
			this._active = this._device.command;

			if (this._active && LAST) {
				this._hold = true;
			}

			const REAL_X = this._device.x - Engine.offsetLeft;
			const REAL_Y = this._device.y - Engine.offsetTop;
			this.x = Math.floor(REAL_X * Engine.width / Engine.realWidth);
			this.y = Math.floor(REAL_Y * Engine.height / Engine.realHeight);
		}
	}

	class Mouse extends Point {
		constructor(event) {
			super();
			this.updateCoordinates(event);

			addEventListener("mousedown", (event) => {
				event.preventDefault();
				this._isDown = true;
			}, false);

			addEventListener("mousemove", (event) => {
				this.updateCoordinates(event);
			}, false);

			addEventListener("mouseup", (event) => {
				event.preventDefault();
				this._isDown = false;
			}, false);
		}

		get command() {
			return this._isDown;
		}

		updateCoordinates(event) {
			event.preventDefault();
			this.x = event.x ?? event.clientX ?? 0;
			this.y = event.y ?? event.clientY ?? 0;
		}
	}

	class Rect extends Point {
		constructor(x, y, width = 0, height = 0) {
			super(x, y);
			this.width = width;
			this.height = height;
		}

		get left() {
			return this.x;
		}

		get right() {
			return this.x + this.width - 1;
		}

		get top() {
			return this.y;
		}

		get bottom() {
			return this.y + this.height - 1;
		}

		get centerX() {
			return this.x + Math.floor(this.width / 2);
		}

		get centerY() {
			return this.y + Math.floor(this.height / 2);
		}

		get center() {
			return new Point(this.centerX, this.centerY);
		}

		setWidth(width) {
			this.width = width;
			return this;
		}

		setHeight(height) {
			this.height = height;
			return this;
		}

		setSize(rect) {
			this.setWidth(rect.width);
			this.setHeight(rect.height);
			return this;
		}

		setLeft(x) {
			this.x = x;
			return this;
		}

		set left(x) {
			this.setLeft(x);
		}

		setRight(x) {
			this.x = x - this.width + 1;
			return this;
		}

		set right(x) {
			this.setRight(x);
		}

		setTop(y) {
			this.y = y;
			return this;
		}

		set top(y) {
			this.setTop(y);
		}

		setBottom(y) {
			this.y = y - this.height + 1;
			return this;
		}

		set bottom(y) {
			this.setBottom(y);
		}

		setCenterX(x) {
			this.x = x - Math.floor(this.width / 2);
			return this;
		}

		set centerX(x) {
			this.setCenterX(x);
		}

		setCenterY(y) {
			this.y = y - Math.floor(this.height / 2);
			return this;
		}

		set centerY(y) {
			this.setCenterY(y);
		}

		setCenter(point) {
			this.setCenterX(point.x);
			this.setCenterY(point.y);
			return this;
		}

		set center(point) {
			this.setCenter(point);
		}

		makeUnion(rect) {
			const RECT = new Rect(Math.min(this.x, rect.x), Math.min(this.y, rect.y));

			return RECT
				.setWidth(Math.max(this.right, rect.right) - RECT.x + 1)
				.setHeight(Math.max(this.bottom, rect.bottom) - RECT.y + 1);
		}

		// deprecated
		union(rect) {
			return this.makeUnion(rect);
		}
	}

	class RenderableList {
		constructor() {
			this._elements = [];
		}

		add(renderable) {
			this._elements.push(renderable);
		}

		render(context) {
			for (let i = 0; i < this._elements.length; ++i) {
				this._elements[i].render(context);
			}

			this._elements.length = 0;
		}
	}

	class Sound {
		constructor() {
			this._isFading = false;
			this._isMute = false;
			this._nextThemeName = null;
			this._queue = {};
			this._theme = null;
			this._themeId = null;
			this._volume = 100;
			this.soundEffectsVolume = 0.3;
		}

		fadeOut() {
			if (!this._theme) {
				return;
			}

			this._isFading = true;
			this._volume = 100;
		}

		mute() {
			this._isMute = !this._isMute;

			if (!this._isMute) {
				this._theme.play();
			} else {
				this._theme.pause();
			}
		}

		pause() {
			if (this._theme) {
				this._theme.pause();
			}
		}

		play(id) {
			if (this._isMute) {
				return;
			}

			this._queue[id] = true;
		}

		playTheme(id) {
			if (id == this._themeId) {
				return;
			}

			if (this._theme && this._theme.currentTime > 0) {
				this._nextThemeName = id;

				if (!this._isFading) {
					this.fadeOut();
				}

				return;
			}

			this.stopTheme();
			this._theme = getElement(id);
			this._themeId = id;

			if (this._theme.currentTime > 0) {
				this._theme.currentTime = 0;
			}

			if (this._isMute) {
				return;
			}

			this._theme.volume = 1;
			this._theme.play();
		}

		resume() {
			if (this._isMute) {
				return;
			}

			if (this._theme.paused) {
				this._theme.play();
			}
		}

		stopTheme() {
			this._isFading = false;

			if (this._theme) {
				this._theme.pause();
				this._theme.currentTime = 0;
				this._themeId = null;
			}
		}

		update() {
			for (let i in this._queue) {
				const SOUND = getElement(i);
				SOUND.pause();

				if (SOUND.currentTime > 0) {
					SOUND.currentTime = 0;
				}

				SOUND.volume = this.soundEffectsVolume;
				SOUND.play();
			}

			this._queue = {};

			if (this._isFading) {
				if (--this._volume > 0) {
					this._theme.volume = this._volume / 100;
				} else {
					this.stopTheme();
					this._isFading = false;
					this._theme = null;

					if (this._nextThemeName) {
						this.playTheme(this._nextThemeName);
						this._themeId = this._nextThemeName;
						this._nextThemeName = null;
					}
				}
			}
		}
	}

	class Sprite extends Rect {
		constructor() {
			super();
			this.accelerationX = 0;
			this.accelerationY = 0;
			this.alpha = 1;
			this.boundary = null;
			this.color = null;
			this.essential = false;
			this.expiration = 0;
			this.expired = false;
			this.layerIndex = 0;
			this.maxSpeedX = 0;
			this.maxSpeedY = 0;
			this.solid = false;
			this.speedX = 0;
			this.speedY = 0;
			this.visible = true;
			this._animation = null;
			this._lastSpeedX = 0;
			this._lastSpeedY = 0;
			this._lastX = this.x;
			this._lastY = this.y;
			this._tags = {};
			this._tick = 0;
		}

		get angle() {
			return toDegrees(Math.atan2(this.speedY, this.speedX));
		}

		get direction() {
			const DIRECTION = new Direction();

			if (this.x < this._lastX) {
				DIRECTION.setLeft();
			} else if (this.x > this._lastX) {
				DIRECTION.setRight();
			}

			if (this.y < this._lastY) {
				DIRECTION.setTop();
			} else if (this.y > this._lastY) {
				DIRECTION.setBottom();
			}

			return DIRECTION;
		}

		get image() {
			return this._animation && this._animation.image;
		}

		get tick() {
			return this._tick;
		}

		setAccelerationX(accelerationX = 0) {
			this.accelerationX = accelerationX;
			return this;
		}

		setAccelerationY(accelerationY = 0) {
			this.accelerationY = accelerationY;
			return this;
		}

		setAlpha(alpha = 1) {
			this.alpha = alpha;
			return this;
		}

		setBoundary(rect = null) {
			this.boundary = rect || this.scene;
			return this;
		}

		setColor(color) {
			this.color = color;
			return this;
		}

		setEssential(isEssential = true) {
			this.essential = isEssential;
			return this;
		}

		setExpiration(expiration = 0) {
			this.expiration = expiration;
			return this;
		}

		setExpired(isExpired = true) {
			this.expired = isExpired;
			return this;
		}

		setLayerIndex(layerIndex = 0) {
			this.layerIndex = layerIndex;
			return this;
		}

		setMaxSpeedX(maxSpeedX = 0) {
			this.maxSpeedX = maxSpeedX;
			return this;
		}

		setMaxSpeedY(maxSpeedY = 0) {
			this.maxSpeedY = maxSpeedY;
			return this;
		}

		setSolid(isSolid = true) {
			this.solid = isSolid;
			return this;
		}

		setSpeedX(speedX = 0) {
			this.speedX = speedX;
			return this;
		}

		setSpeedY(speedY = 0) {
			this.speedY = speedY;
			return this;
		}

		setVisible(isVisible = true) {
			this.visible = isVisible;
			return this;
		}

		setAnimation(animation) {
			if (animation == this._animation) {
				return this;
			}

			this._animation = animation;
			this._animation.setFrameIndex(0);
			this.height = this._animation.height;
			this.width = this._animation.width;
			return this;
		}

		setImage(image) {
			this.setAnimation(new Animation([new Frame(image)]));
			return this;
		}

		set image(image) {
			this.setImage(image);
		}

		setSpeedToAngle(speed, degrees) {
			const RADIANS = toRadians(degrees);
			this.setSpeedX(speed * Math.cos(RADIANS));
			this.setSpeedY(speed * Math.sin(RADIANS));
			return this;
		}

		setSpeedToPoint(speed, point) {
			const SQUARE_DISTANCE = Math.abs(this.centerX - point.x) + Math.abs(this.centerY - point.y);
			this.setSpeedX((point.x - this.centerX) * speed / SQUARE_DISTANCE);
			this.setSpeedY((point.y - this.centerY) * speed / SQUARE_DISTANCE);
			return this;
		}

		addTag(tag) {
			this._tags[tag] = true;
			return this;
		}

		bounceFrom(direction) {
			if ((this.speedX < 0 && direction.left) || (this.speedX > 0 && direction.right)) {
				this.bounceX();
			}

			if ((this.speedY < 0 && direction.top) || (this.speedY > 0 && direction.bottom)) {
				this.bounceY();
			}

			return this;
		}

		bounceX() {
			this.setSpeedX(this.speedX * -1);
			this.x += this.speedX;
			return this;
		}

		bounceY() {
			this.setSpeedY(this.speedY * -1);
			this.y += this.speedY;
			return this;
		}

		expire() {
			this.expired = true;
		}

		getCollision(sprite) {
			const DIRECTION = new Direction();
			const TA = this.top;
			const RA = this.right;
			const BA = this.bottom;
			const LA = this.left;
			const XA = this.centerX;
			const YA = this.centerY;
			const TB = sprite.top;
			const RB = sprite.right;
			const BB = sprite.bottom;
			const LB = sprite.left;

			if (XA <= LB && RA < RB) {
				DIRECTION.setRight();
			} else if (XA >= RB && LA > LB) {
				DIRECTION.setLeft();
			}

			if (YA <= TB && BA < BB) {
				DIRECTION.setBottom();
			} else if (YA >= BB && TA > TB) {
				DIRECTION.setTop();
			}

			return DIRECTION;
		}

		hasCollision(rect) {
			return !(
				this.left > rect.right ||
		this.right < rect.left ||
		this.top > rect.bottom ||
		this.bottom < rect.top
			);
		}

		hasTag(tag) {
			return this._tags[tag];
		}

		init() {
			// no default behavior
		}

		offBoundary() {
			this.setExpired();
		}

		onAnimationLoop() {
			// no default behavior
		}

		onCollision(sprite) {
			// no default behavior
			return sprite;
		}

		pause() {
			this._lastSpeedX = this.speedX;
			this._lastSpeedY = this.speedY;
			this.speedX = 0;
			this.speedY = 0;
			return this;
		}

		render(context) {
			if (!this.visible) {
				return false;
			}

			const X = Math.floor(this.x + this.scene.x);
			const Y = Math.floor(this.y + this.scene.y);

			if (this.alpha < 1) {
				context.globalAlpha = this.alpha;
			}

			if (this.color) {
				context.fillStyle = this.color;
				context.fillRect(X, Y, this.width, this.height);
			}

			if (this._animation) {
				context.drawImage(this._animation.image, X, Y, this.width, this.height);
			}

			if (this.alpha < 1) {
				context.globalAlpha = 1;
			}

			return true;
		}

		resume() {
			this.speedX = this._lastSpeedX;
			this.speedY = this._lastSpeedY;
			return this;
		}

		stop() {
			this._lastSpeedX = 0;
			this._lastSpeedY = 0;
			this.speedX = 0;
			this.speedY = 0;
		}

		sync() {
			if (this.expired) {
				return true;
			}

			if (++this._tick == this.expiration) {
				this.setExpired();
			}

			if (this._animation && this._animation.sync()) {
				this.onAnimationLoop();
			}

			this.speedX += this.accelerationX;
			this.speedY += this.accelerationY;

			if (this.maxSpeedX && Math.abs(this.speedX) > this.maxSpeedX) {
				const SIGNAL = this.speedX / Math.abs(this.speedX);
				this.speedX = this.maxSpeedX * SIGNAL;
			}

			if (this.maxSpeedY && Math.abs(this.speedY) > this.maxSpeedY) {
				const SIGNAL = this.speedY / Math.abs(this.speedY);
				this.speedY = this.maxSpeedY * SIGNAL;
			}

			this._lastX = this.x;
			this._lastY = this.y;
			this.x += this.speedX;
			this.y += this.speedY;

			if (this.boundary && !this.hasCollision(this.boundary)) {
				this.offBoundary();
			}

			return false;
		}

		update() {
			// no default behavior
		}

		zoom(ratio) {
			const widthChange = this.width * ratio;
			this.width += widthChange;
			this.x -= widthChange / 2;
			const heightChange = this.height * ratio;
			this.height += heightChange;
			this.y -= heightChange / 2;
			return this;
		}
	}

	class Scene extends Sprite {
		constructor() {
			super();
			this.height = Engine.height;
			this.width = Engine.width;
			this._sprites = [];
			this._spritesQueue = [];
		}

		init() {
			// no default behavior
		}

		add(sprite) {
			this._spritesQueue.push(sprite);
			sprite.scene = this;
			sprite.init();
			sprite.x -= sprite.speedX;
			sprite.y -= sprite.speedY;
			return this;
		}

		build(map, tileFactory = null, offsetX = 0, offsetY = 0, x = 0, y = 0) {
			tileFactory = tileFactory ?? function baseTileFactory(id) {
				return new Sprite().addTag("tile").setImage(id);
			};

			for (let i = 0; i < map.length; ++i) {
				const LINE = map[i];

				for (let j = 0; j < LINE.length; ++j) {
					const ID = map[i][j];

					if (!ID || "" == ID.trim()) {
						continue;
					}

					const TILE = tileFactory(ID);

					if (TILE) {
						const X = offsetX || TILE.width;
						const Y = offsetY || TILE.height;
						TILE.x = x + j * X;
						TILE.y = y + i * Y;
						this.add(TILE);
					}
				}
			}

			return this;
		}

		sync() {
			Engine.paint(this, this.layerIndex);
			let sprites = [];
			const solidSprites = [];

			for (let i = 0; i < this._sprites.length; ++i) {
				const sprite = this._sprites[i];
				sprite.update();

				if (sprite.sync()) {
					if (sprite.essential) {
						this.setExpired();
					}
				} else {
					if (sprite.solid) {
						solidSprites.push(sprite);
					}

					sprites.push(sprite);
					Engine.paint(sprite, sprite.layerIndex);
				}

				sprite.collided = false;
			}

			checkCollisions(solidSprites);
			this._sprites = sprites.concat(this._spritesQueue);
			this._spritesQueue = [];
			return Sprite.prototype.sync.call(this);
		}

		getObjectsWithTag(tag) {
			const RESULT = [];
			const SPRITES = this._sprites.concat(this._spritesQueue);

			for (let i = 0; i < SPRITES.length; ++i) {
				const SPRITE = SPRITES[i];

				if (SPRITE.hasTag(tag)) {
					RESULT.push(SPRITE);
				}
			}

			return RESULT;
		}

		setTransition(transition) {
			this.transition = transition;
			return this;
		}
	}

	class TextSprite extends Sprite {
		constructor(text) {
			super();
			this.fontColor = Color.White;
			this.text = text;
			this._fontFamily = FontFamily.Monospace;
			this._fontSize = 16;
			this._updateFont();
		}

		render(context) {
			if (Sprite.prototype.render.call(this, context)) {
				context.fillStyle = this.fontColor;
				context.font = this._font;
				context.fillText(this.text, this.left + this.scene.x, this.bottom + this.scene.y, this.width);
			}
		}

		setFontColor(fontColor) {
			this.fontColor = fontColor;
			return this;
		}

		setFontFamily(fontFamily) {
			this._fontFamily = fontFamily;
			this._updateFont();
			return this;
		}

		setFontSize(fontSize) {
			this._fontSize = fontSize;
			this._updateFont();
			return this;
		}

		setText(text) {
			this.text = text;
			return this;
		}

		get fontFamily() {
			return this._fontFamily;
		}

		get fontSize() {
			return this._fontSize;
		}

		set fontFamily(fontFamily) {
			this.setFontFamily(fontFamily);
		}

		set fontSize(fontSize) {
			this.setFontSize(fontSize);
		}

		_updateFont() {
			this._font = this._fontSize + "px " + this._fontFamily;
		}
	}

	class Touch extends Point {
		constructor(event) {
			super();
			event.preventDefault();
			this._isDown = true;
			this.updateCoordinates(event);

			addEventListener("touchend", (event) => {
				event.preventDefault();
				this._isDown = false;
				this.updateCoordinates(event);
			}, false);

			addEventListener("touchmove", (event) => {
				event.preventDefault();
				this.updateCoordinates(event);
			}, false);

			addEventListener("touchstart", () => {
				event.preventDefault();
				this._isDown = true;
				this.updateCoordinates(event);
			}, false);
		}

		get command() {
			return this._isDown;
		}

		updateCoordinates(event) {
			const TOUCHES = event.changedTouches;
			const TOUCH = TOUCHES[0];
			this.x = TOUCH.pageX;
			this.y = TOUCH.pageY;
		}
	}

	class Transition extends Sprite {
		init() {
			this.setColor(Color.Black);
			this.setHeight(this.scene.height);
			this._increase = this.scene.width / 32;
		}

		sync() {
			if (this.width > this.scene.width) {
				return true;
			}

			this.width += this._increase;
			return Sprite.prototype.sync.call(this);
		}
	}

	const Engine = (() => {
		let _autoScale = true;
		let _canvas = getElement("game") || getElements(CANVAS_ELEMENT)[0];
		let _context = _canvas.getContext(CONTEXT);
		let _everyOther = true;
		let _frameTime = DEFAULT_FRAME_TIME;
		let _height = _canvas.height;
		let _imageCache = {};
		let _keepAspect = false;
		let _input = new Input();
		let _lastRender;
		let _name = "Game";
		let _realHeight = _canvas.height;
		let _realWidth = _canvas.width;
		let _renderableLists = [];
		let _scene;
		let _sound = new Sound();
		let _transition;
		let _width = _canvas.width;

		class Engine {
			static init(scene) {
				_scene = scene;
				boot(_canvas, _context);
			}

			static get bottom() {
				return _height - 1;
			}

			static get center() {
				return new Point(this.centerX, this.centerY);
			}

			static get centerX() {
				return Math.floor(_width / 2);
			}

			static get centerY() {
				return Math.floor(_height / 2);
			}

			static get height() {
				return _height;
			}

			static getName() {
				return _name;
			}

			static get offsetLeft() {
				return _canvas.offsetLeft;
			}

			static get offsetTop() {
				return _canvas.offsetTop;
			}

			static get right() {
				return _width - 1;
			}

			static get everyOther() {
				return _everyOther;
			}

			static get frameTime() {
				return _frameTime;
			}

			static get realHeight() {
				return _realHeight;
			}

			static get realWidth() {
				return _realWidth;
			}

			static get width() {
				return _width;
			}

			static addControllerDevice(device) {
				_input.addController(device);
			}

			static clear() {
				_context.clearRect(0, 0, _width, _height);
			}

			static colorize(image, fillStyle, compositeOperation = CompositeOperations.SOURCE_IN) {
				const input = getImage(image);
				const output = document.createElement(CANVAS_ELEMENT);
				output.width = input.width;
				output.height = input.height;
				const context = output.getContext(CONTEXT);
				context.drawImage(input, 0, 0);
				context.globalCompositeOperation = compositeOperation;
				context.fillStyle = fillStyle;
				context.fillRect(0, 0, output.width, output.height);
				return output;
			}

			static fadeOut() {
				_sound.fadeOut();
			}

			static flip(image) {
				return invert(image, false, true);
			}

			static getController(id) {
				return _input.getController(id);
			}

			static get controller() {
				return this.getController();
			}

			static getPointer(id) {
				return _input.getPointer(id);
			}

			static get pointer() {
				return this.getPointer();
			}

			static load(namespace) {
				const container = localStorage[namespace ?? Engine.getName()];
				let result;

				try {
					result = container && JSON.parse(container);
				} catch (error) {
					console.log("Could not load saved game: " + error);
				}

				return result;
			}

			static mirror(image) {
				return invert(image, true, false);
			}

			static mute() {
				_sound.mute();
			}

			static paint(renderable, index = 0) {
				if (index >= _renderableLists.length) {
					for (let i = _renderableLists.length; i <= index; ++i) {
						_renderableLists.push(new RenderableList());
					}
				}

				_renderableLists[index].add(renderable);
			}

			static play(id) {
				_sound.play(id);
			}

			static playTheme(name) {
				_sound.playTheme(name);
			}

			static random(max) {
				return Math.floor(Math.random() * (max + 1));
			}

			static rotate(image, degrees) {
				const input = getImage(image);
				degrees = degrees % 360;

				if (degrees == 0 ) {
					return input;
				}

				const output = document.createElement(CANVAS_ELEMENT);
				output.width = input.width;
				output.height = input.height;
				const context = output.getContext(CONTEXT);
				context.translate(output.width / 2, output.height / 2);
				context.rotate(toRadians(degrees));
				context.drawImage(input, -input.width / 2, -input.height / 2);
				return output;
			}

			static save(data, namespace) {
				try {
					localStorage[namespace || Engine.getName()] = data && JSON.stringify(data);
				} catch (error) {
					console.log("Could not save current game: " + error);
				}
			}

			static setAutoScale(customAutoScale = true) {
				_autoScale = customAutoScale;
			}

			static setFrameTime(frameTime) {
				_frameTime = frameTime ?? DEFAULT_FRAME_TIME;
			}

			static setKeepAspect(customKeepAspect = true) {
				_keepAspect = customKeepAspect;
			}

			static setName(name) {
				_name = name;
				document && (document.title = _name);
			}

			static stopTheme() {
				_sound.stopTheme();
			}

			// factories
			static animation(frames) {
				return new Animation(frames);
			}

			static frame(image, duration) {
				return new Frame(image, duration);
			}

			static image(id, isMirror, isFlip) {
				if (isFlip && isMirror) {
					if (_imageCache[id] && _imageCache[id].flipMirror) {
						return _imageCache[id].flipMirror;
					}

					_imageCache[id] = _imageCache[id] || {};
					_imageCache[id].flipMirror = invert(getElement(id), true, true);
					return _imageCache[id].flip;
				}

				if (isFlip) {
					if (_imageCache[id] && _imageCache[id].flip) {
						return _imageCache[id].flip;
					}

					_imageCache[id] = _imageCache[id] || {};
					_imageCache[id].flip = Engine.flip(getElement(id));
					return _imageCache[id].flip;
				}

				if (isMirror) {
					if (_imageCache[id] && _imageCache[id].mirror) {
						return _imageCache[id].mirror;
					}

					_imageCache[id] = _imageCache[id] || {};
					_imageCache[id].mirror = Engine.mirror(getElement(id));
					return _imageCache[id].mirror;
				}

				return getElement(id);
			}

			static point(x, y) {
				return new Point(x, y);
			}

			static rect(x, y, width, height) {
				return new Rect(x, y, width, height);
			}

			static scene() {
				return new Scene();
			}

			static sprite(scene) {
				return new Sprite(scene);
			}
		}

		function boot(canvas, context) {
			addEventListener("blur", focus, false);
			addEventListener("click", focus, false);
			addEventListener("focus", focus, false);
			addEventListener("load", focus, false);
			addEventListener("resize", scale, false);
			focus();
			scale();
			const images = getElements("img");
			const total = images.length;
			let complete = 0;

			for (let i = 0; i < images.length; ++i) {
				const IMAGE = images[i];

				if (IMAGE.complete) {
					++complete;
				}
			}

			context.fillStyle = Color.Blue;
			context.fillRect(0, 0, canvas.width * complete / total, canvas.height);

			if (complete < total) {
				setTimeout(() => {
					boot(canvas, context);
				}, 100);

				return;
			}

			initScene();
			_lastRender = Date.now();
			loop();
		}

		function focus() {
			window && window.focus();
		}

		function initScene() {
			if (!_scene) {
				throw new Error("Could not get the next scene");
			}

			_scene.scene = new Point();
			_scene.height = _scene.height || _height;
			_scene.width = _scene.width || _width;
			_scene.init();
		}

		function invert(image, isMirror, isFlip) {
			const input = getImage(image);
			const output = document.createElement(CANVAS_ELEMENT);
			output.width = input.width;
			output.height = input.height;
			const context = output.getContext(CONTEXT);
			context.translate(isMirror ? output.width : 0, isFlip ? output.height : 0);
			context.scale(isMirror ? -1 : 1, isFlip ? - 1 : 1);
			context.drawImage(input, 0, 0);
			return output;
		}

		function loop() {
			_everyOther = !_everyOther;
			_input.update();

			if (_transition != null) {
				if (_transition.sync()) {
					_transition = null;
					initScene();
				} else {
					Engine.paint(_transition);
				}
			} else {
				if (_scene.sync()) {
					_transition = _scene.transition;

					if (_transition) {
						_transition.scene = _scene;
						_transition.init();
					}

					_scene = _scene.next;

					if (!_transition) {
						initScene();
					}
				} else {
					_scene.update();
				}
			}

			_sound.update();
			window.requestAnimationFrame(render);
		}

		function render() {
			for (let i = 0; i < _renderableLists.length; ++i) {
				_renderableLists[i].render(_context);
			}

			setTimeout(loop, _frameTime + _lastRender - Date.now());
			_lastRender = Date.now();
		}

		function scale() {
			if (!_autoScale) {
				return;
			}

			let width, height;

			if (_keepAspect) {
				let proportion = window.innerWidth / _canvas.width;

				if (window.innerHeight < _canvas.height * proportion) {
					proportion = window.innerHeight / _canvas.height;
				}

				width = _canvas.width * proportion;
				height = _canvas.height * proportion;
			} else {
				width = window.innerWidth;
				height = window.innerHeight;
			}

			_realWidth = width;
			_realHeight = height;
			_canvas.style.width = width + "px";
			_canvas.style.height = height + "px";
		}

		return Engine;
	})();

	function checkCollisions(sprites) {
		const LENGTH = sprites.length;

		for (let i = 0; i < LENGTH - 1; ++i) {
			const LEFT_SPRITE = sprites[i];

			for (let j = i + 1; j < LENGTH; ++j) {
				const RIGHT_SPRITE = sprites[j];

				if (LEFT_SPRITE.hasCollision(RIGHT_SPRITE)) {
					LEFT_SPRITE.collided = true;
					LEFT_SPRITE.onCollision(RIGHT_SPRITE);
					RIGHT_SPRITE.collided = true;
					RIGHT_SPRITE.onCollision(LEFT_SPRITE);
				}
			}
		}
	}

	function getElement(id) {
		return document.getElementById(id);
	}

	function getElements(name) {
		return Array.from(document.getElementsByTagName(name));
	}

	function getGamepads() {
		if (!navigator.getGamepads) {
			return [];
		}

		return navigator.getGamepads();
	}

	function getImage(image) {
		if ("string" == typeof(image)) {
			return getElement(image);
		}

		return image;
	}

	function makeEnum(array) {
		return makeHash(array, true);
	}

	function makeHash(array, indexed) {
		const RESULT = {};

		for (let i = 0; i < array.length; ++i) {
			const VALUE = array[i];
			RESULT[VALUE] = indexed ? i : VALUE;
		}

		return RESULT;
	}

	function toDegrees(radians) {
		return radians * 180 / Math.PI;
	}

	function toRadians(degrees) {
		return degrees * Math.PI / 180;
	}

	const EXPORTS = {
		Animation,
		Color,
		Command,
		CompositeOperations,
		FontFamily,
		Frame,
		Point,
		Rect,
		Scene,
		Sprite,
		TextSprite,
		Transition,
		Core2D,
	};

	if ("object" == typeof(module)) {
		module.exports = EXPORTS;
	} else if ("object" == typeof(window)) {
		window.core2d = EXPORTS;
	}
})();
