YUI.add("tri-towers", function (Y) {
	var Solitaire = Y.Solitaire,
	TriTowers = Y.Solitaire.TriTowers = instance(Solitaire, {
		fields: ["Deck", "Foundation", "Tableau"],

		createEvents: function () {
			Y.on("solitaire|endTurn", function () {
				var tableaus = Solitaire.game.tableau.stacks,
				    i;

				for (i = 0; i < 3; i++) {
					Y.fire("tableau:afterPop", tableaus[i]);
				}
			});
			Solitaire.createEvents.call(this);
		},

		deal: function () {
			var card,
			    stack,
			    stacks = this.tableau.stacks,
			    deck = this.deck,
			    foundation = this.foundation.stacks[0],

			    i, stackLength;

			for (stack = 0; stack < 4; stack++) {
				stackLength = (stack + 1) * 3;

				for (i = 0; i < stackLength; i++) {
					card = deck.pop();
					stacks[stack].push(card);
					stack === 3 && card.faceUp();
				}
			}

			card = deck.pop().faceUp();
			foundation.push(card);

			deck.createStack();
		},

		turnOver: function () {
			var deck = this.deck.stacks[0],
			    foundation = this.foundation.stacks[0],
			    last = deck.last();

			last && last.faceUp().moveTo(foundation);
		},

		Deck: instance(Solitaire.Deck, {
			field: "deck",
			stackConfig: {
				total: 1,
				layout: {
					hspacing: 0,
					top: function () { return Solitaire.Card.height * 4; },
					left: 0
				}
			},

			createStack: function () {
				var i, len;

				for (i = 0, len = this.cards.length; i < len; i++) {
					this.stacks[0].push(this.cards[i]);
				}
			}
		}),

		Tableau: {
			field: "tableau",
			stackConfig: {
				total: 4,
				layout: {
					vspacing: 0.6,
					hspacing: -0.625,
					top: 0,
					left: function () { return Solitaire.Card.width * 3; }
				}
			}
		},

		Foundation: {
			field: "foundation",
			stackConfig: {
				total: 1,
				layout: {
					hspacing: 0,
					top: function () { return Solitaire.Card.height * 4; },
					left: function () { return Solitaire.Card.width * 4; }
				}
			}
		},

		Events: instance(Solitaire.Events, {
			dragCheck: function () {
				Solitaire.game.autoPlay.call(this);
				this.dd.end();
			}
		}),
		/*
		 * return true if the target is 1 rank away from the this card
		 * Aces and Kings are valid targets for each other
		 */
		Card: instance(Solitaire.Card, {
			validTarget: function (stack) {
				if (stack.field !== "foundation") { return false; }

				var card = stack.last(),
				    diff = Math.abs(this.rank - card.rank);

				return diff === 1 || diff === 12;
			},

			isFree: function () {
				var stack = this.stack,
				    next = stack.next(),
				    tower = this.tower(),
				    index = stack.cards.indexOf(this),
				    covering,
				    i;

				if (stack.field !== "tableau") { return false; }

				if (!next) { return true; }

				for (i = 0; i < 2; i++) {
					covering = next.cards[index + tower + i];

					if (covering && covering.tower() === tower) { return false; }
				}

				return true;
			},

			tower: function () {
				var stack = this.stack,
				    index = stack.cards.indexOf(this),
				    stackIndex = stack.index() + 1;

				return Math.floor(index / stackIndex);
			}
		}, true)
	}, true);

	Y.Array.each(TriTowers.fields, function (field) {
		TriTowers[field].Stack = instance(TriTowers.Stack);
	});

	Y.mix(TriTowers.Tableau.Stack, {
		deleteItem: function (card) {
			var cards = this.cards,
			    i = cards.indexOf(card);

			if (i !== -1) { cards[i] = null; }
		},

		setCardPosition: function (card) {
			var last = this.last(),
			    top = this.top,
			    left,
			    index,
			    stackIndex,
			    
			    rowGaps = [3.75, 2.5, 1.25, 0];

			if (last) {
				left = last.left + card.width * 1.25;
				index = this.cards.indexOf(last) + 1;
				stackIndex = this.index() + 1;

				if (!(index % stackIndex)) { left += rowGaps[stackIndex - 1] * card.width; }
			} else {
				left = this.left;
			}

			card.top = top;
			card.left = left;
			card.zIndex = this.index() * 10;
		}
	}, true);

	Y.mix(TriTowers.Deck.Stack, {
		setCardPosition: function (card) {
			var last = this.last(),
			    top,
			    left,
			    zIndex;

			top = this.top;
			if (last) {
				left = last.left + card.width * 0.1;
				zIndex = last.zIndex + 1;
			} else {
				left = this.left;
				zIndex = 0;
			}

			card.top = top;
			card.left = left;
			card.zIndex = zIndex;
		}
	}, true);
}, "0.0.1", {requires: ["solitaire"]});