
import {defaultData} from 'json!./defaultData.json';

class DatabaseController {
  connect() {
    this.database = window.firebase.database();
    this.rootRef = this.database.ref();   
  }

  getDataFromLocalStorage() {
    this.userID = localStorage.getItem('userID');
    if (this.userID) {
      var data = JSON.parse(localStorage.getItem("data"));
      return data || []; 
    }
    else {
      return defaultData;
    }
  }

  saveDataToLocalStorage(data) {
    var serialData = JSON.stringify(data);
    localStorage.setItem("data", serialData);
  }

  getDataFromServer(callback) {
    if (this.userID) {
      this.userRef = this.database.ref(this.userID);
      this.userRef.once(
        'value',
        (data) => {
          var cards = data.val();
          cards.forEach(
            (card) => (card.tasks ? '' : card.tasks = [])
          );
          callback(cards || []);
        },
        (error) => {
          console.error("database.getDataFromServer() " + error);
        }
      );
    }
    else {
      this.addNewUser(
        (key) => {
          this.userID = key;
          this.userRef = this.database.ref(key);
          localStorage.setItem('userID', key);
          callback(defaultData);
        }
      );
    }    
  }

  addNewUser(callback) {
    this.userRef = this.rootRef.push();
    let key = this.userRef.key;
    this.userRef.set(defaultData, function(error) {
      if (error) {
        console.log('database.addNewUser(): ' + error);
      }
      else {
        callback(key);
      }     
    });
  }

  addTask(task, index, cardIndex, failCallback) {
    let tasksRef = this.userRef.child('' + cardIndex).child('tasks');
    task.id = tasksRef.push().key;   

    tasksRef.child(index.toString()).set(task, function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }      
    });
  }

  deleteTask(index, cardIndex, failCallback) {
    let tasksRef = this.userRef.child(cardIndex.toString()).child('tasks');   

    tasksRef.child(index.toString()).remove(function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }      
    });
  }

  toggleTask(doneValue, index, cardIndex, failCallback) {
    let tasksRef = this.userRef.child(cardIndex.toString()).child('tasks');   

    tasksRef.child(index.toString()).update({done: doneValue}, function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }      
    });
  }

  addCard(card, index, failCallback) {
    card.id = this.userRef.push().key;
    if (!card.tasks.length) 
      card = Object.assign({}, card, {tasks: false});

    this.setCard(card, index, failCallback);
  }

  setCard(card, index, failCallback) {
    this.userRef.child(index.toString()).set(card, function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }      
    });
  }

  saveAllCards(cards, failCallback) {
    this.userRef.set(cards, function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }     
    });
  }
}

export default DatabaseController;