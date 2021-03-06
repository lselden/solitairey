(function () {
	function cacheNode(selector) {
		let node;

		return function () {
			if (!node) {
				node = Y.one(selector);
			}
			return node;
		};
	}

	var active = {
		name: 'Klondike',
		game: null
	};
		/* remove {fetchCSS: false, bootstrap: false} during development when additional YUI modules are needed
		 * TODO: generate this in the build script
		 */
	var yui = YUI({fetchCSS: false, bootstrap: false});
	var Y;
	var body = cacheNode('body');
	var games = {
		accordion: 'Accordion',
		acesup: 'AcesUp',
		agnes: 'Agnes',
		alternations: 'Alternations',
		bakersdozen: 'BakersDozen',
		bakersgame: 'BakersGame',
		baroness: 'Baroness',
		bisley: 'Bisley',
		doubleklondike: 'DoubleKlondike',
		calculation: 'Calculation',
		canfield: 'Canfield',
		eightoff: 'Eightoff',
		'king-albert': 'KingAlbert',
		klondike: 'Klondike',
		klondike1t: 'Klondike1T',
		thefan: 'TheFan',
		'flower-garden': 'FlowerGarden',
		'forty-thieves': 'FortyThieves',
		freecell: 'Freecell',
		golf: 'Golf',
		'grandfathers-clock': 'GClock',
		labellelucie: 'LaBelleLucie',
		'monte-carlo': 'MonteCarlo',
		pyramid: 'Pyramid',
		'russian-solitaire': 'RussianSolitaire',
		'simple-simon': 'SimpleSimon',
		scorpion: 'Scorpion',
		spider: 'Spider',
		spider1s: 'Spider1S',
		spider2s: 'Spider2S',
		spiderette: 'Spiderette',
		'tri-towers': 'TriTowers',
		'will-o-the-wisp': 'WillOTheWisp',
		yukon: 'Yukon'
	};

	var extensions = [
		'json',
		'tabview',
		'util',
		'auto-turnover',
			'statistics',
		'win-display',
		'solver-freecell',
		'solitaire-autoplay',
			'solitaire-ios',
		'display-seed-value',
		'save-manager',
		'analytics'
	];

	var nameMap = {
		Accordion: 'Accordion',
		AcesUp: 'Aces Up',
		Agnes: 'Agnes',
		Alternations: 'Alternations',
		BakersDozen: 'Baker\'s Dozen',
		BakersGame: 'Baker\'s Game',
		Baroness: 'Baroness',
		Bisley: 'Bisley',
		Calculation: 'Calculation',
		Canfield: 'Canfield',
		DoubleKlondike: 'Double Klondike',
		Eightoff: 'Eight Off',
		Klondike: 'Klondike',
		Klondike1T: 'Klondike (Vegas style)',
		TheFan: 'The Fan',
		FlowerGarden: 'Flower Garden',
		FortyThieves: 'Forty Thieves',
		Freecell: 'Freecell',
		Golf: 'Golf',
		GClock: 'Grandfather\'s Clock',
		LaBelleLucie: 'La Belle Lucie',
		KingAlbert: 'King Albert',
		MonteCarlo: 'Monte Carlo',
		Pyramid: 'Pyramid',
		RussianSolitaire: 'Russian Solitaire',
		Scorpion: 'Scorpion',
		SimpleSimon: 'Simple Simon',
		Spider: 'Spider',
		Spider1S: 'Spider (1 Suit)',
		Spider2S: 'Spider (2 Suit)',
		Spiderette: 'Spiderette',
		WillOTheWisp: 'Will O\' The Wisp',
		TriTowers: 'Tri Towers',
		Yukon: 'Yukon'
	};

	var Fade = (function () {
		let el = null;
		let css = {
			position: 'absolute',
			display: 'none',
			backgroundColor: '#000',
			opacity: 0.7,
			top: 0,
			left: 0,
			width: 0,
			height: 0,
			zIndex: 1000
		};

		let element = function () {
			if (el === null) {
				el = Y.Node.create('<div>');
				el.setStyles(css);
				body().append(el);
			}
			return el;
		};

		return {
			show() {
				const el = element();

				css.display = 'block';
				css.width = el.get('winWidth');
				css.height = el.get('winHeight');

				el.setStyles(css);
			},

			hide() {
				css.display = 'none';
				element().setStyles(css);
			},

			resize() {
				if (css.display === 'block') { this.show(); }
			}
		};
	})();

	var Rules = (function () {
		let popupNode = cacheNode('#rules-popup'),
			description,
			rootNode,
			visible = false;

		function sourceNode() {
			return Y.one('#' + active.name);
		}

		return {
			show() {
				description = sourceNode().one('.description');
				popupNode().one('button').insert(description, 'before');
				popupNode().removeClass('hidden');
				Fade.show();
				visible = true;
			},

			hide() {
				if (!(visible && description)) { return; }

				sourceNode().appendChild(description);
				popupNode().addClass('hidden');
				Fade.hide();
				visible = false;
			}
		};
	})();

	var GameChooser = {
		selected: null,
		fade: false,

		init() {
			this.refit();
		},

		node: cacheNode('#game-chooser'),

		refit() {
			let node = Y.one('#game-chooser'),
			height = node.get('winHeight');

			node.setStyle('min-height', height);
		},

		show(fade) {
			if (!this.selected) {
				this.select(active.name);
			}

			if (fade) {
				Fade.show();
				this.fade = true;
			}

			this.node().addClass('show').append(Backgrounds.node());
			body().addClass('scrollable');
		},

		hide() {
			if (this.fade) {
				Fade.hide();
			}

			this.node().removeClass('show');
			Y.fire('gamechooser:hide', this);
			body().removeClass('scrollable').append(Backgrounds.node());
		},

		choose() {
			if (!this.selected) { return; }

			this.hide();
			playGame(this.selected);
		},

		select(game) {
			let node = Y.one('#' + game + '> div'),
			previous = this.selected;

			if (previous !== game) {
				this.unSelect();
			}

			if (node) {
				this.selected = game;
				new Y.Node(document.getElementById(game)).addClass('selected');
			}

			if (previous && previous !== game) {
				Y.fire('gamechooser:select', this);
			}
		},

		unSelect() {
			if (!this.selected) { return; }

			new Y.Node(document.getElementById(this.selected)).removeClass('selected');
			this.selected = null;
		}
	};

	var OptionsChooser = {
		selector: '#options-chooser',

		initInputs() {
			let option,
			options = Options.properties,
			value;

			for (option in options) {
				if (!options.hasOwnProperty(option)) { continue; }

				value = options[option].get();
				if (typeof value === 'boolean') {
					document.getElementById(option + '-toggle').checked = value;
				}
			}
		},

		attachEvents() {
			Y.delegate('change', function (e) {
				let name = this.get('id').replace('-toggle', ''),
				option = Options.properties[name];

				if (option) {
					option.set(this.get('checked'));
					Options.save();
				}
			}, this.selector, 'input[type=checkbox]');

			Y.delegate('click', function () {
				Backgrounds.load(this.getData('item'));
				Options.save();
			}, '#background-options .backgrounds', '.background');

			Y.delegate('click', function (e) {
				Themes.load(this.getData('item'));
				Preloader.preload(false);
				Preloader.loaded(resize);
				Options.save();
			}, '#graphics-options .cards', '.card-preview');
		},

		element: (function () {
			let element;

			function createList(collection, selector, callback) {
				let item,
				all = collection.all,
				current = collection.current,
				list = Y.one(selector),
				node;

				for (item in all) {
					if (!all.hasOwnProperty(item)) { continue; }

					collection.current = item;
					node = callback(collection).setData('item', item);

					if (item === current) {
						node.addClass('selected');
					}

					list.append(node);
				}

				collection.current = current;
			}

			return function () {
				let tabview;

				if (!element) {
					element = Y.one(OptionsChooser.selector);
					tabview = new Y.TabView({
						srcNode: element.one('.tabview')
					});
					tabview.render();

					OptionsChooser.initInputs();
					OptionsChooser.attachEvents();

					createList(Themes, '#graphics-options .cards', collection => {
						return Y.Node.create(Y.Lang.sub(
						'<li class=card-preview><img src={base}/facedown.png><img src={base}/h12.png></li>', {
							base: collection.basePath(90)
						}));
					});

					createList(Backgrounds, '#background-options .backgrounds', collection => {
						const el = Y.Node.create('<li class=background></li>');
						const bg = collection.all[collection.current];
						if (bg.gradient) {
							return el.setStyle('backgroundImage', bg.gradient);
						}
						return el.setStyle('backgroundImage', 'url(' + bg.image + ')');
					});
				}

				return element;
			};
		})()
	};

	var show = function () {
		Fade.show();
		this.element().removeClass('hidden');
	};

	var hide = function () {
		Fade.hide();
		this.element().addClass('hidden');
	};

	var Options = {
		properties: {
			cardTheme: {
				set(value) {
					Themes.load(value);
				},

				get() {
					return Themes.current || Themes.defaultTheme;
				}
			},

			autoplay: {
				set(value) {
					const autoplay = Y.Solitaire.Autoplay;

					value ? autoplay.enable() : autoplay.disable();
				},

				get() {
					return Y.Solitaire.Autoplay.isEnabled();
				}
			},

			animateCards: {
				set(value) {
					Y.Solitaire.Animation.animate = value;
				},

				get() {
					return Y.Solitaire.Animation.animate;
				}
			},

			autoFlip: {
				set(value) {
					const autoflip = Y.Solitaire.AutoTurnover;

					value ? autoflip.enable() : autoflip.disable();
				},

				get() {
					return Y.Solitaire.AutoTurnover.isEnabled();
				}
			},

			enableSolver: {
				set(value) {
					const solver = Y.Solitaire.Solver.Freecell;

					value ? solver.enable() : solver.disable();
				},

				get() {
					return Y.Solitaire.Solver.Freecell.isEnabled();
				}
			},

			background: {
				set(value) {
					Backgrounds.load(value);
				},

				get() {
					return Backgrounds.current || Backgrounds.defaultBackground;
				}
			}
		},

		load() {
			let options;

			options = localStorage.options;

			if (!options) {
				options = Y.Cookie.get('full-options');
				Y.Cookie.remove('full-options');
			}

			try {
				Y.JSON.parse(options, this.set.bind(this));
			} catch (e) {
			// do nothing as we'll just use the default settings
			}

			if (!Themes.current) { Themes.load(); }
			if (!Backgrounds.current) { Backgrounds.load(); }
		},

		save() {
			localStorage.options = Y.JSON.stringify(mapObject(this.properties, (key, value) => {
				return value.get();
			}));
		},

		set(key, value) {
			const prop = this.properties[key];

			if (prop) {
				prop.set(value);
			}
		}
	};

	var Themes = {
		all: {
			"dots": {
				sizes: [148],
				148: {
					hiddenRankHeight: 17,
					rankHeight: 50,
					dimensions: [148, 200]
				}
			},

			dondorf: {
				sizes: [61, 79, 95, 122],
				61: {
					hiddenRankHeight: 7,
					rankHeight: 25,
					dimensions: [61, 95]
				},

				79: {
					hiddenRankHeight: 10,
					rankHeight: 32,
					dimensions: [79, 123]
				},

				95: {
					hiddenRankHeight: 12,
					rankHeight: 38,
					dimensions: [95, 148]
				},

				122: {
					hiddenRankHeight: 15,
					rankHeight: 48,
					dimensions: [122, 190]
				}
			},

			'jolly-royal': {
				sizes: [144],
				144: {
					hiddenRankHeight: 20,
					rankHeight: 52,
					dimensions: [144, 200]
				}
			},

			paris: {
				sizes: [131],
				131: {
					hiddenRankHeight: 18,
					rankHeight: 48,
					dimensions: [131, 204]
				}
			}
		},

		current: null,
	// defaultTheme: "jolly-royal",
		defaultTheme: 'paris',

	/* theres no mechanism yet to load the appropriate deck depending on the scaled card width
	 * so we just load the largest cards and call it a day :/
	 */
		snapToSize(width) {
			let theme = this.all[this.current],
			sizes = theme.sizes;

			width = clamp(width || 0, sizes[0], sizes[sizes.length - 1]) >>> 0;

			while (Y.Array.indexOf(sizes, width) === -1) {
				width++;
			}

			return width;
		},

		basePath(width) {
			return this.current + '/' + this.snapToSize(width);
		},

		load(name) {
			let Solitaire = Y.Solitaire,
			base = Solitaire.Card.base,
			sizes;
			window.Solitaire = Solitaire;
			if (!(name in this.all)) {
				name = this.defaultTheme;
			}

			this.current = name;

			sizes = this.all[name].sizes;
			this.set(sizes[sizes.length - 1]);
		},

		set(size) {
			const theme = this.all[this.current][size];

			Y.mix(Y.Solitaire.Card.base, {
				theme: this.basePath(size),
				hiddenRankHeight: theme.hiddenRankHeight,
				rankHeight: theme.rankHeight,
				width: theme.dimensions[0],
				height: theme.dimensions[1]
			}, true);
		}
	};

	var Backgrounds = {
		all: {
			green: {
				image: 'green.jpg',
				size: '100%'
			},
			black: {
				gradient: 'linear-gradient(#333,#000)'
			}
		},
		current: null,
		defaultBackground: 'black',
		stylesheet: null,

		load(name) {
			if (!(name in this.all)) {
				name = this.defaultBackground;
			}

			this.current = name;
			this.set();
		},

		set() {
			let selected = this.all[this.current];
			if (selected.gradient) {
				if (this.imageNode()) { this.imageNode().hide(); }
				this.node().setStyle('backgroundImage', selected.gradient);
			} else if (selected.repeat) {
				if (this.imageNode()) { this.imageNode().hide(); }
				this.node().setStyle('backgroundImage', 'url(' + selected.image + ')');
			} else {
				this.node().setStyle('backgroundImage', 'none');
				if (this.imageNode()) { this.imageNode().set('src', selected.image).show(); }
			}
		},

		resize() {
			let selected = this.all[this.current],
			img = this.imageNode(),
			width = img.get('width'),
			height = img.get('height'),
			winWidth = img.get('winWidth'),
			winHeight = img.get('winHeight'),
			ratioWidth, ratioHeight,
			ratio;

			if (selected.repeat || selected.gradient) { return; }

			if (selected.size === 'cover') {
				ratioWidth = width / winWidth;
				ratioHeight = height / winHeight;
				ratio = ratioWidth < ratioHeight ? ratioWidth : ratioHeight;
				img.setAttrs({width: Math.ceil(width / ratio), height: Math.ceil(height / ratio)});
			} else if (selected.size === '100%') {
				img.setAttrs({width: winWidth, height: winHeight});
			}

			img.show();
		},

		imageNode: cacheNode('#background-image'),
		node() {
			let node = Y.one('#background');
			let image;

			if (!node) {
				node = Y.Node.create('<div id=background>').appendTo(body());
				image = Y.Node.create('<img id=background-image>');
				image.set('draggable', false);
				image.on('load', this.resize.bind(this));
				node.append(image);
			}

			return node;
		}
	};

	function clamp(value, low, high) {
		return Math.max(Math.min(value, high), low);
	}

	function mapObject(source, mapper) {
		let mapped = {},
			key;

		for (key in source) {
			if (!source.hasOwnProperty(key)) { continue; }

			mapped[key] = mapper.call(source, key, source[key]);
		}

		return mapped;
	}

	function modules() {
		let modules = extensions.slice(),
			m;

		for (m in games) {
			if (games.hasOwnProperty(m)) {
				modules.unshift(m);
			}
		}

		return modules;
	}

	function main(YUI) {
		Y = YUI;

		exportAPI();
		Y.on('domready', load);
	}

	function showDescription() {
		GameChooser.select(this._node.id);
		GameChooser.choose();
	}

	let aboutPopup = cacheNode('#about-popup'),
		statsPopup = cacheNode('#stats-popup'),
		winPopup = cacheNode('#win-display');

	function showPopup(popup) {
		Y.fire('popup', popup);
	}

	const Confirmation = {
		promptNode: cacheNode('#confirmation-prompt'),
		node: cacheNode('#confirmation'),
		affirmButton: cacheNode('#confirmation-affirm'),
		denyButton: cacheNode('#confirmation-deny'),
		active: false,

		attachEvents(callback) {
			this.affirmButton().once('click', () => {
				callback();
				this.hide();
			});

			this.denyButton().once('click', () => {
				this.hide();
			});
		},

		resize() {
			if (!this.active) { return; }

			this.node().setStyles({
				width: this.node().get('winWidth') + 'px',
				height: this.node().get('winHeight') + 'px'
			});
		},

		hide() {
			this.active = false;
			this.node().addClass('hidden');
		},

		show(prompt, callback) {
			this.active = true;
			this.attachEvents(callback);
			this.promptNode().set('text', prompt);
			this.node().removeClass('hidden');
			this.resize();
		}
	};

	function attachEvents() {
		const hideMenus = function () {
			GameChooser.hide();
			OptionsChooser.hide();
			Rules.hide();
			statsPopup().addClass('hidden');
			aboutPopup().addClass('hidden');
			Fade.hide();
		};

		Y.on('click', restart, Y.one('#restart'));
		Y.on('click', showPopup.partial('GameChooser'), Y.one('#choose-game'));
		Y.on('click', showPopup.partial('OptionsChooser'), Y.one('#choose-options'));
		Y.on('click', showPopup.partial('Rules'), Y.one('#rules'));
		Y.on('click', showPopup.partial('About'), Y.one('#about'));
		Y.on('click', () => { active.game.undo(); }, Y.one('#undo'));
		Y.on('click', newGame, Y.one('#new-deal'));
		Y.on('click', Y.Solitaire.Statistics.statsDisplay, Y.one('#stats'));
		Y.on('submit', () => {
			Y.Solitaire.Analytics.track('Donations', 'Click', 'Paypal button');
		}, Y.one('#donate'));

		Y.delegate('click', showDescription, '#descriptions', 'li');

		Y.on('click', hideMenus, '.close-chooser');

		Y.one('document').on('keydown', e => {
			if (e.keyCode === 27) {
				hideMenus();
			}
		});
		document.body.addEventListener('keypress', event => {
			if (event.code === 'KeyZ' && event.ctrlKey) {
				// active.game.undo();
				document.querySelector('#undo').click();
			}
		});

		Y.on('afterSetup', () => {
			active.game.stationary(() => {
				resize();
			});
		});

		Y.on('Application|popup', popup => {
			winPopup().addClass('hidden');

			switch (popup) {
				case 'GameChooser':
					GameChooser.show(false);
					break;
				case 'OptionsChooser':
					OptionsChooser.show();
					break;
				case 'About':
					aboutPopup().removeClass('hidden');
					Fade.show();
					break;
				case 'Rules':
					Rules.show();
					break;
				case 'Stats':
					statsPopup().removeClass('hidden');
					Fade.show();
					break;
			}
		});

		Y.on('fieldResize', (ratio, w, h) => {
			active.game.resize(ratio);
		});

		attachResize();
	}

	function attachResize() {
		let timer,
			delay = 250,
			attachEvent;

		if (window.addEventListener) {
			attachEvent = 'addEventListener';
		} else if (window.attachEvent) {
			attachEvent = 'attachEvent';
		}

		window[attachEvent](Y.Solitaire.Application.resizeEvent, () => {
			clearTimeout(timer);
			timer = setTimeout(resize, delay);
		}, false);
	}

	function resize() {
		let game = active.game,
			el = game.container(),
			padding = game.padding,
			offset = game.offset,
			width = el.get('winWidth') - padding.x,
			height = el.get('winHeight') - padding.y,
			screenWidth = el.get('winWidth'),
			ratio = 1;

		Y.Solitaire.Application.windowHeight = height;
		ratio = Math.min((width - normalize(offset.left)) / game.width(), (height - normalize(offset.top)) / game.height());

		Y.fire('fieldResize', ratio, width, height);
		GameChooser.refit();
		Fade.resize();
		Backgrounds.resize();
		Confirmation.resize();
	}

	function playGame(name) {
		active.name = name;
		active.game = lookupGame(name);

		newGame();
	}

	function lookupGame(name) {
		return Y.Solitaire[games[name]] || Y.Solitaire[name];
	}

	function load() {
		const save = Y.Solitaire.SaveManager.getSavedGame();

		if (save.name !== '') {
			active.name = save.name;
		}

		attachEvents();
		Options.load();

		Preloader.preload();
		Preloader.loaded(() => {
			if (save.serialized !== '') {
				clearDOM();
				active.game = lookupGame(active.name);

				try {
					active.game.cleanup();
					active.game.loadGame(save.serialized);
				} catch (e) {
					playGame(active.name);
				}
			} else {
				playGame(active.name);
			}
		});

		GameChooser.init();
	}

	function clearDOM() {
		Y.all('.stack, .card').remove();
	}

	function restart() {
		let save = Y.Solitaire.SaveManager.getSavedGame('initial-game'),
			game = active.game;

		clearDOM();
		game.cleanup();

		if (save.serialized !== '') {
			game.loadGame(save.serialized);
		} else {
			game.newGame();
		}
	}

	function newGame() {
		const game = active.game;

		clearDOM();
		game.cleanup();
		game.newGame();
	}

	function exportAPI() {
		Y.Solitaire.Application = {
			windowHeight: 0,
			resizeEvent: 'resize',
			GameChooser,
			Confirmation,
			newGame,
			nameMap,
			currentTheme() { return Themes.current; }
		};
	}

	var Preloader = {
		loadingCount: 0,
		showFade: true,

		loaded(callback) {
			if (this.loadingCount) {
				setTimeout(() => {
					this.loaded(callback);
				}, 100);
			} else {
				Y.one('.loading').addClass('hidden');
				callback();
				if (this.showFade) {
					Fade.hide();
				}
			}
		},

		load(path) {
			const image = new Image();

			image.onload = function () {
				--this.loadingCount;
			}.bind(this);

			// don't freeze the page if there's an error preloading an image
			image.onerror = function () {
				--this.loadingCount;
			}.bind(this);

			image.src = path;

			this.loadingCount++;
		},

		preload(fade) {
			let rank,
			icons = ['agnes',
				'flower-garden',
				'forty-thieves',
				'freecell',
				'gclock',
				'golf',
				'klondike1t',
				'klondike',
				'montecarlo',
				'pyramid',
				'scorpion',
				'spider1s',
				'spider2s',
				'spiderette',
				'spider',
				'tritowers',
				'will-o-the-wisp',
				'yukon'];

			Y.Array.each(['s', 'h', 'c', 'd'], function (suit) {
				for (rank = 1; rank <= 13; rank++) {
					this.load(Y.Solitaire.Card.base.theme + '/' + suit + rank + '.png');
				}
			}, this);

			this.load(Y.Solitaire.Card.base.theme + '/facedown.png');
			this.load(Y.Solitaire.Card.base.theme + '/freeslot.png');

			Y.Array.each(icons, function (image) {
				this.load('layouts/mini/' + image + '.png');
			}, this);

			this.showFade = fade !== false;
			if (this.showFade) {
				Fade.show();
			}

			Y.one('.loading').removeClass('hidden');
		}
	};

	yui.use.apply(yui, modules().concat(main));
})();
