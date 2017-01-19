
class DatabaseController {
  constructor() {
    this.database = window.firebase.database();
    this.cardsRef = this.database.ref('cardsList');
  }

  getData(callback) {
    this.cardsRef.once(
      'value',
      (data) => {
        var cards = data.val();
        cards.forEach(
          (card) => (card.tasks ? '' : card.tasks = [])
        );
        callback(cards);
      },
      (error) => {
        console.error("Error fetching and parsing data " + error);
      }
    );
  }

  addTask(task, index, cardIndex, failCallback) {
    let tasksRef = this.cardsRef.child('' + cardIndex).child('tasks');
    task.id = tasksRef.push().key;   

    tasksRef.child(index.toString()).set(task, function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }      
    });
  }

  deleteTask(index, cardIndex, failCallback) {
    let tasksRef = this.cardsRef.child(cardIndex.toString()).child('tasks');   

    tasksRef.child(index.toString()).remove(function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }      
    });
  }

  toggleTask(doneValue, index, cardIndex, failCallback) {
    let tasksRef = this.cardsRef.child(cardIndex.toString()).child('tasks');   

    tasksRef.child(index.toString()).update({done: doneValue}, function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }      
    });
  }

  addCard(card, index, failCallback) {
    card.id = this.cardsRef.push().key;
    if (!card.tasks.length) 
      card = Object.assign({}, card, {tasks: false});

    this.setCard(card, index, failCallback);
  }

  setCard(card, index, failCallback) {
    this.cardsRef.child(index.toString()).set(card, function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }      
    });
  }

  saveAllCards(cards, failCallback) {
    this.cardsRef.set(cards, function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }     
    });
  }
}

export default DatabaseController;