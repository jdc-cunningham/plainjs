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
    this.payAmount = 0;
  }

  generateRandomStr(length) {
    return Math.random().toString(36).substr(2, length);
  }

  isNumber(n) {
    // checks integer or float from SO
    if (!n) {
      var n = this.cardBalance.value;
    }

    // this makes '1.2b' pass, adding regex pattern check
    // if (n.indexOf('.') !== -1) {
    //   n = parseFloat(n);
    // } else {
    //   n = parseInt(n);
    // }

    var regexp = /^[0-9]+([,.][0-9]+)?$/g;
    var isIntFloat = regexp.test(n);
    
    if (isIntFloat) {
      return true;
    }

    const isFloat = (n) => {
      return n === +n && n !== (n|0);
    }
    
    const isInteger = (n) => {
      return n === +n && n === (n|0);
    }

    if (isInteger(n) || isFloat(n)) {
      return true;
    }

    return false;
  }

  validAmount(amount) {
    if (this.isNumber(amount)) {
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
    var cardObj = useLocalStorage ? this.userCards[cardId] : this.addedCards[cardId];
    var cardPay = cardObj.pay ? cardObj.pay : '',
        cardElem = '<div id="' + cardId + '" class="right__card-block" draggable="true">' +
          '<button type="button" class="card-block__delete-card">' +
            // this is technically not correct
            '<span>x</span>' + 
            '<img class="card-block__move-icon" src="./assets/icons/top_bottom_arrow.svg" alt="move-icon" />' +
          '</button>' +
          '<div class="card-block__wrapper">' +
            '<div class="card-block__name">' + cardObj.name + '</div>' +
            '<div class="card-block__balance">' +
              '<span>$' + cardObj.balance + '</span>' +
              '<span>$' + cardPay + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';

    this.cardContainerElem.innerHTML += cardElem;
  }

  renderStoredCards() {
    if (this.userCards) {
      var userCards = this.userCards,
          self = this;
      this.addedCards = userCards;
      Object.keys(userCards).map( (key, index) => {
        self.renderNewCard(key, true);
      });
    }
    this.bindHoverClassListener();
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
    document.querySelectorAll('.right__card-block').forEach( (cardBlock) => {
      cardBlock.remove();
    });
  }

  reRenderCards() {
    this.clearCards();

    var newSortCards = {},
        self = this;

    Object.keys(this.addedCards).forEach( (key) => {
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

  bindHoverClassListener() {
    document.querySelectorAll('.card-block__wrapper').forEach( (elem) => {
      elem.addEventListener('mouseenter', (e) => {
        e.target.parentNode.classList.add('hover');
      });

      elem.addEventListener('mouseleave', (e) => {
        e.target.parentNode.classList.remove('hover');
      });
    });
  }

  addCard() {
    if (this.checkEmptyFields()) {
      alert('Please fill in all fields');
      return false;
    }

    if (!this.isNumber(null)) {
      alert('Please enter a whole number or 1');
      return false;
    }

    var cardId = this.checkIdAvailable(this.generateRandomStr(8));

    this.addedCards[cardId] = {
      name: this.cardName.value,
      balance: this.cardBalance.value
    };

    this.renderNewCard(cardId, false);
    this.updateStorage();
    this.bindHoverClassListener();
  }

  updateCardPay() {

  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new CardPaymentCalculator();

  app.renderStoredCards();

  // add card
  app.getAddCardBtn().addEventListener('click', () => {
    app.addCard();
  });

  document.addEventListener('keypress', (e) => {
    var key = e.which || e.keyCode,
        activeElementId = e.target.getAttribute('id');

    if (key === 13 && (activeElementId === 'card_name' || activeElementId === 'card_balance')) { // 13 is enter from SO
      app.addCard();
    }
  });

  // delete card
  app.cardElemContainer.addEventListener('click', (e) => {
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

  document.querySelector('.app-wrapper-right').addEventListener('dragstart', (e) => {
    var target = e.target;

    if (e.target.classList.contains('right__card-block')) {
      app.draggedRow = target.getAttribute('id');
    }
  });

  document.querySelector('.app-wrapper-right').addEventListener('dragend', (e) => {
    app.reRenderCards();
  });

  document.querySelector('.app-wrapper-right').addEventListener('dragover', (e) => {
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

  document.getElementById('pay_amount').addEventListener('keyup', (e) => {
    var payAmount = e.target.value;
    if (payAmount !== '') {
      if (!app.validAmount(payAmount)) {
        alert('Please enter a whole number or decimal 2');
        e.target.value = app.payAmount;
      } else {
        app.payAmount = payAmount;
      }
    }
  });
});