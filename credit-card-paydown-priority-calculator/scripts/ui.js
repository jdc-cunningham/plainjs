class CardPaymentCalculator {
  constructor() {
    this.cardName = document.getElementById('card_name');
    this.cardBalance = document.getElementById('card_balance');
    this.addCardBtn = document.getElementById('add_card_btn');
    this.addedCards = {};
    this.cardContainerElem = document.querySelector('.app-wrapper-right');
    this.userCards = JSON.parse(localStorage.getItem('user_cards'));
  }

  generateRandomStr(length) {
    return Math.random().toString(36).substr(2, length);
  }

  isNumber() {
    // checks integer or float from SO
    var n = this.cardBalance.value;

    if (n.indexOf('.') !== -1) {
      n = parseFloat(n);
    } else {
      n = parseInt(n);
    }

    function isFloat(n) {
      return n === +n && n !== (n|0);
    }
    
    function isInteger(n) {
      return n === +n && n === (n|0);
    }

    if (isInteger(n) || isFloat(n)) {
      return true;
    }

    return false;
  }

  getCardName() {
    return this.cardName.value;
  }

  getCardBalance() {
    return this.cardBalance.value;
  }

  getAddCardBtn() {
    return this.addCardBtn;
  }

  checkEmptyFields() {
    if (this.cardName.value === '' || this.cardBalance.value === '') {
      return true;
    }
    return false;
  }

  // can this get stuck in a loop ?
  checkIdAvailable(id) {
    if (id in this.addedCards) {
      this.checkIdAvailable(this.generateRandomStr(8)); // try again
    } else {
      return id;
    }
  }

  renderNewCard(cardId, useLocalStorage) {
    var cardObj = useLocalStorage ? this.userCards[cardId] : this.addedCards[cardId],
        cardElem = '<div class="right__card-block" data-card-id="' + cardId + '">' +
          '<button type="button" class="card-block__delete-card">x</button>' +
          '<div class="card-block__wrapper">' +
            '<div class="card-block__name">' + cardObj.name + '</div>' +
            '<div class="card-block__balance">$' + cardObj.balance + '</div>' +
          '</div>' +
        '</div>';

    this.cardContainerElem.innerHTML += cardElem;
  }

  renderStoredCards() {
    if (this.userCards) {
      var userCards = this.userCards,
          self = this;
      Object.keys(userCards).map( function(key, index) {
        self.renderNewCard(key, true);
      });
    }
  }

  updateStorage() {
    localStorage.setItem('user_cards', JSON.stringify(this.addedCards));
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const app = new CardPaymentCalculator();

  app.renderStoredCards();

  app.getAddCardBtn().addEventListener('click', function() {
    if (app.checkEmptyFields()) {
      alert('Please fill in all fields');
      return false;
    }

    if (!app.isNumber()) {
      alert('Please enter a number or decimal');
    }

    var cardId = app.checkIdAvailable(app.generateRandomStr(8));

    app.addedCards[cardId] = {
      name: app.cardName.value,
      balance: app.cardBalance.value
    };

    app.renderNewCard(cardId, false);
    app.updateStorage();
  });
});