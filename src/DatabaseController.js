import {defaultData} from 'json!./defaultData.json';
import 'array-find-index';

class DatabaseController {
  connect() {
    this.database = window.firebase.database();
    this.rootRef = this.database.ref(); 
    this.userRef = null;
    this.cardsRef = null;
    this.data = null;  
  }

  authUser(callback) {
    if (this.userID) {
      this.checkUserExist((isExist) => {
        if (isExist)
          callback();
        else
          this.addNewUser(callback);
      });      
    }
    else {
      this.addNewUser(callback);
    }
  }

  checkUserExist(callback) {
    this.rootRef.once(
      'value',
      (data) => {
        callback(data.hasChild(this.userID));
      },
      (error) => {
        console.error("database.checkUserExist() " + error);
      }
    );
  }

  addNewUser(callback) {
    this.userRef = this.rootRef.push();
    let key = this.userRef.key;
    this.userRef.set(defaultData, (error) => {
      if (error) {
        console.log('database.addNewUser(): ' + error);
      }
      else {
        this.userID = key;
        localStorage.setItem('userID', key);
        callback();
      }     
    });
  } 

  getDataFromLocalStorage() {
    this.userID = localStorage.getItem('userID');
    if (this.userID) {
      var data = JSON.parse(localStorage.getItem("data"));
      return data; 
    }
    else {
      return this.convertDataFormat(defaultData);
    }
  }

  saveDataToLocalStorage(data) {
    var serialData = JSON.stringify(data);
    localStorage.setItem("data", serialData);
  }

  getDataFromServer(callback) {
    this.userRef = this.database.ref(this.userID);
    this.userRef.once(
      'value',
      (data) => {
        this.data = data.val();
        this.setCardsRef();       
        callback(this.convertDataFormat(data.val()));
      },
      (error) => {
        console.error("database.getDataFromServer() " + error);
      }
    ); 
  }

  setCardsRef() {
    this.cardsRef = this.userRef
      .child('boards')
      .child(this.getBoardKeyByName(this.data.selectedBoard, this.data.boards))
      .child('cards');
  }

  getBoardKeyByName(boardName, boards) {
    const boardKeys = Object.keys(boards);
    for (let i = 0; i < boardKeys.length; ++i)
      if (boards[boardKeys[i]].name === boardName)
        return boardKeys[i];
  }

  getCardsByBoardKey(boardKey, boards) {
    const cards = boards[boardKey].cards || [];
    cards.forEach((card) => (card.tasks ? '' : card.tasks = []));
    return cards;
  }

  getCardsByBoardName(boardName, callback) {
    let boardKey = this.getBoardKeyByName(boardName, this.data.boards);
    this.userRef.child('boards').once(
      'value',
      (snapshot) => {
        let cards = this.getCardsByBoardKey(boardKey, snapshot.val());       
        callback(cards);
      }
    ); 
  }

  convertDataFormat(data) {
    const boards = data.boards;
    const boardKeys = Object.keys(boards);
    const boardName = data.selectedBoard;
    const boardKey = this.getBoardKeyByName(boardName, boards);   

    let boardNames = boardKeys.map((key) => boards[key].name);
    const cards = this.getCardsByBoardKey(boardKey, boards);

    return {
      cards: cards,
      boardNames: boardNames,
      selectedBoardName: boardName
    };
  }


  selectBoard(boardName) {
    this.userRef.child("selectedBoard").set(boardName, (error) => {
      if (error) {
        console.log('selectBoard() ' + error);
      } else {
        this.data.selectedBoard = boardName;
        this.setCardsRef();
      }      
    });
  }

  addBoard(boardName, failCallback) {
    let newBoardRef = this.userRef.child("boards").push();
    let board = {name: boardName, cards: []};    
    newBoardRef.set(
      board, 
      (error) => {
        if (error) {
          console.log('database.addBoard(): ' + error);
          failCallback();
        }
        else {
          this.data.boards[newBoardRef.key] = board;
          this.selectBoard(boardName);
        }    
      }
    );
  }

  removeBoard(boardName, successCallback, failCallback) {
    let boardKey = this.getBoardKeyByName(boardName, this.data.boards);
    console.log(boardKey);
    this.userRef.child("boards").child(boardKey).remove((error) => {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback()
      }
      else {
        delete this.data.boards[boardKey];
        successCallback();
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
    if (!cards.length)
      cards = false;
    this.cardsRef.set(cards, function(error) {
      if (error) {
        console.log('Synchronization failed ' + error);
        failCallback();
      }     
    });
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
}


export default DatabaseController;