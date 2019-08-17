document.addEventListener("DOMContentLoaded", function() {
  class CardPaymentCalculator {
    constructor() {
      this.cardName = document.getElementById('card_name');
      this.cardBalance = document.getElementById('card_balance');
      this.addCardBtn = document.getElementById('add_card_btn');
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
      if (this.cardName.value === '' || this.cardBalance === '') {
        return true;
      }
      return false;
    }
  }

  const app = new CardPaymentCalculator();

  app.getAddCardBtn().addEventListener('click', function() {
    if (app.checkEmptyFields()) {
      alert('Please fill in all fields');
      return false;
    }
  });
});