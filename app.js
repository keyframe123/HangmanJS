class Hangman {
	constructor(words) {
		this.input = document.getElementById('guess-input');
		this.bodyStyle = document.body.style;
		this.messageText = document.querySelector('.message-text');
		this.counterValue = document.querySelector('.counter-display .value');
		this.submitBtn = document.getElementById('submit');
		this.restartBtn = document.getElementById('restart');
		this.incorrectList = document.querySelector('.incorrect-letters');

		this.parts = ['basic', 'head', 'eye1', 'eye2', 'nose', 'mouth', 'body', 'arm1', 'arm2', 'leg1', 'leg2'];
		this.words = words.split(' ');
		this.chosenWord = '';
		this.displayWord = [];
		this.remainingGuesses = 10;
		this.endRound = false;
		this.wrongMsgTimeout = null;
		this.incorrectSet = new Set();
	}

	init() {
		this.resetUI();
		this.chooseWord();
		this.resetGuesses();
		this.updateCounter();
		this.parts.forEach(part => this.hidePart(part));
		this.showPart(this.parts[0]);
		this.updateMessage(this.getWordDisplay());
	}

	getWordDisplay() {
		return `Das Wort ist ${this.displayWord.join('')}`;
	}

	chooseWord() {
		const idx = Math.floor(Math.random() * this.words.length);
		this.chosenWord = this.words[idx];
		this.displayWord = Array.from(this.chosenWord).map(() => '*');
		this.displayWord[0] = this.displayWord[0].toUpperCase();
	}

	resetGuesses() {
		this.remainingGuesses = 10;
		this.endRound = false;
		this.incorrectList.innerHTML = '';
		this.incorrectSet.clear();
	}

	resetUI() {
		document.querySelector('.message-wrong').classList.add('hidden');
		this.bodyStyle.backgroundColor = '#b3b3b3';
		this.incorrectList.innerHTML = '';
		this.input.value = '';
		this.input.focus();
	}

	updateCounter() {
		this.counterValue.textContent = this.remainingGuesses;
	}

	updateMessage(text, isWrong = false) {
		this.messageText.textContent = text;
		this.messageText.classList.remove('hidden');

		if (isWrong) {
			clearTimeout(this.wrongMsgTimeout);
			this.wrongMsgTimeout = setTimeout(() => {
				this.messageText.textContent = this.getWordDisplay();
			}, 2500);
		}
	}

	showPart(name) {
		const img = document.querySelector(`img[data-part="${name}"]`);
		img.classList.remove('hidden');
	}

	hidePart(name) {
		const img = document.querySelector(`img[data-part="${name}"]`);
		img.classList.add('hidden');
	}

	playerWon() {
		this.chosenWord = this.chosenWord[0].toUpperCase() + this.chosenWord.slice(1);
		this.updateMessage(`Das Wort ist "${this.chosenWord}", du hast gewonnen!`);
		this.bodyStyle.backgroundColor = '#1e8229';
		this.input.value = '';
		this.endRound = true;
	}

	playerLost() {
		this.updateMessage(`Leider verloren! Das Wort wäre "${this.chosenWord}" gewesen.`);
		this.bodyStyle.backgroundColor = '#a62323';
		this.counterValue.textContent = 0;
		this.input.value = '';
		this.endRound = true;
	}

	handleCorrectInput(letter) {
		const indices = this.chosenWord
			.split('')
			.map((c, i) => (c === letter ? i : -1))
			.filter(i => i >= 0);

		indices.forEach(i => (this.displayWord[i] = letter));
		this.displayWord[0] = this.displayWord[0].toUpperCase();

		this.updateMessage(this.getWordDisplay());
		this.input.value = '';
		this.input.focus();

		if (!this.displayWord.includes('*')) {
			this.playerWon();
		}
	}

	handleWrongInput(letter) {
		if (this.incorrectSet.has(letter)) {
			this.input.value = '';
			this.input.focus();
			return;
		}

		this.remainingGuesses--;
		const partToShow = this.parts[this.parts.length - this.remainingGuesses - 1];
		const partToHide = this.parts[this.parts.length - this.remainingGuesses - 2];
		this.showPart(partToShow);
		this.hidePart(partToHide);

		if (this.remainingGuesses === 0) {
			return this.playerLost();
		}

		this.updateCounter();
		this.updateMessage(`Nicht enthalten: ${letter}`, true);
		this.addIncorrectLetter(letter);

		this.input.value = '';
		this.input.focus();
	}

	addIncorrectLetter(letter) {
		const li = document.createElement('li');
		li.textContent = letter;
		this.incorrectList.appendChild(li);
		this.incorrectSet.add(letter);
	}

	submitGuess() {
		if (this.endRound) {
			return;
		}

		const letter = this.input.value.trim().toLowerCase();
		if (!letter) {
			return;
		}

		this.chosenWord.includes(letter) ? this.handleCorrectInput(letter) : this.handleWrongInput(letter);
	}
}

const game = new Hangman(wordlist);
game.init();
document.querySelector('#submit').addEventListener('click', () => game.submitGuess());
document.querySelector('#restart').addEventListener('click', () => game.init());
