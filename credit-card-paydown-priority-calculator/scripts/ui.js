class CardPaymentCalculator {
  constructor() {
    this.cardName = document.getElementById('card_name');
    this.cardBalance = document.getElementById('card_balance');
    this.addCardBtn = document.getElementById('add_card_btn');
    this.addedCards = {};
    this.cardContainerElem = document.querySelector('.app-wrapper-right');
    this.userCards = JSON.parse(localStorage.getItem('user_cards'));
    this.cardElemContainer = document.querySelector('.app-wrapper-right');
    this.draggedRow = null;
    this.draggedOverRow = null;
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
        cardElem = '<div id="' + cardId + '" class="right__card-block" draggable="true">' +
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
      this.addedCards = userCards;
      Object.keys(userCards).map( function(key, index) {
        self.renderNewCard(key, true);
      });
    }
  }

  updateStorage() {
    localStorage.setItem('user_cards', JSON.stringify(this.addedCards));
  }

  removeCard(cardId) {
    if (cardId in this.addedCards) { // bad design having multiple stores
      delete this.addedCards[cardId];
      this.updateStorage();
      document.getElementById(cardId).remove();
    }
  }

  clearCards() {
    document.querySelectorAll('.right__card-block').forEach( function(cardBlock) {
      cardBlock.remove();
    });
  }

  reRenderCards() {
    this.clearCards();

    var newSortCards = {},
        self = this;

    Object.keys(this.addedCards).forEach( function(key) {
      if (key === self.draggedOverRow) {
        newSortCards[key] = self.addedCards[self.draggedRow];
      } else if (key === self.draggedRow) {
        newSortCards[key] = self.addedCards[self.draggedOverRow];
      } else {
        newSortCards[key] = self.addedCards[key];
      }
    });

    this.addedCards = this.userCards = newSortCards;
    this.updateStorage();
    this.renderStoredCards();
  }

  addCard() {
    if (this.checkEmptyFields()) {
      alert('Please fill in all fields');
      return false;
    }

    if (!this.isNumber()) {
      alert('Please enter a number or decimal');
      return false;
    }

    var cardId = this.checkIdAvailable(this.generateRandomStr(8));

    this.addedCards[cardId] = {
      name: this.cardName.value,
      balance: this.cardBalance.value
    };

    this.renderNewCard(cardId, false);
    this.updateStorage();
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const app = new CardPaymentCalculator();

  app.renderStoredCards();

  // add card
  app.getAddCardBtn().addEventListener('click', function() {
    app.addCard();
  });

  document.addEventListener('keypress', function(e) {
    var key = e.which || e.keyCode,
        activeElementId = e.target.getAttribute('id');
        
    if (key === 13 && (activeElementId === 'card_name' || activeElementId === 'card_balance')) { // 13 is enter from SO
      app.addCard();
    }
  });

  // delete card
  app.cardElemContainer.addEventListener('click', function(e) {
    var targetNode = e.target;

    if (targetNode.classList.contains('card-block__delete-card')) {
      var cardId = targetNode.parentNode.getAttribute('id'),
          confirmDelete = null;

      if (cardId) {
        confirmDelete = confirm("Delete this card entry?");
      }
          
      if (confirmDelete) {
        app.removeCard(cardId);
      }
    }
  });

  document.querySelector('.app-wrapper-right').addEventListener('dragstart', function(e) {
    var target = e.target;

    if (e.target.classList.contains('right__card-block')) {
      app.draggedRow = target.getAttribute('id');
    }
  });

  document.querySelector('.app-wrapper-right').addEventListener('dragend', function(e) {
    app.reRenderCards();
  });

  document.querySelector('.app-wrapper-right').addEventListener('dragover', function(e) {
    var targetParent = e.target.parentNode;

    if (targetParent.classList.contains('right__card-block')) {
      targetParent = targetParent;
    } else if (targetParent.classList.contains('card-block__wrapper')) {
      targetParent = targetParent.parentNode;
    } else {
      targetParent = null;
    }

    if (targetParent) {
      app.draggedOverRow = targetParent.getAttribute('id');
    }
  });
});