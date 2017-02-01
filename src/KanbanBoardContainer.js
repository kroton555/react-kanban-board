import React, {Component} from 'react';
import KanbanBoard from './KanbanBoard';
import DatabaseController from './DatabaseController';
import update from 'react-addons-update';
import 'whatwg-fetch';
import 'array-find-index';

class KanbanBoardContainer extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      cards: [],
      boardNames: [],
      selectedBoardName: ""
    };
    //throttle(this.updateCardStatus.bind(this));
    //throttle(this.updateCardPosition.bind(this),500);
  }

  componentDidMount() {
    this.database = new DatabaseController();

    var localData = this.database.getDataFromLocalStorage();
    if (localData)
      this.setState(localData);

    this.database.connect();
    this.database.authUser(() => {
      this.database.getDataFromServer(
        (data) => {
          this.setState(data); 
        }
      );
    });   

    window.onbeforeunload = () => {
      this.database.saveDataToLocalStorage(this.state);
    };
  }

  addTask(cardId, taskName) {
    let prevState = this.state;
    let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
    let newTask = {id: '', name: taskName, done: false};
    
    let nextCardsState = update(this.state.cards, {
      [cardIndex]: {
        tasks: {$push: [newTask]}
      }
    });
    this.database.addTask(newTask, 
      nextCardsState[cardIndex].tasks.length - 1, 
      cardIndex,
      () => this.setState(prevState)
    );
    this.setState({cards: nextCardsState});
  }
 
  deleteTask(cardId, taskId, taskIndex) {
    let prevState = this.state;
    let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);

    let nextCardsState = update(this.state.cards, {
      [cardIndex]: {
        tasks: {$splice: [[taskIndex, 1]]}
      }
    });
    this.database.deleteTask(taskIndex, cardIndex,
      () => this.setState(prevState)
    );
    this.setState({cards: nextCardsState});
  }
 
  toggleTask(cardId, taskId, taskIndex) {
    let prevState = this.state;
    let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
    
    let newDoneValue;
    let nextCardsState = update(this.state.cards, {
      [cardIndex]: {
        tasks: {
          [taskIndex]: {
            done: {
              $apply: (done) => {
                newDoneValue = !done;
                return newDoneValue;
              }
            }
          }
        }
      }
    });

    this.database.toggleTask(newDoneValue, 
      taskIndex, cardIndex,
      () => this.setState(prevState)
    );

    this.setState({cards: nextCardsState});
  }

  getIndexByCardId(cardId) {
    const { cards } = this.state;
    for (let i = 0; i < cards.length; ++i)
      if (cards[i].id === cardId)
        return i;

    return -1;
  }

  moveCard(dragCardId, hoverCardId, newStatus, insertAfter) {
    const { cards } = this.state;
    const dragIndex = this.getIndexByCardId(dragCardId);
    let hoverIndex = this.getIndexByCardId(hoverCardId);
    let dragCard = cards[dragIndex];

    if (newStatus) {
      dragCard = update(cards[dragIndex], {
        status: {$set: newStatus}
      });

      if (hoverIndex > dragIndex) {
        if (!insertAfter)
          hoverIndex--;
      }
      else {
        if (insertAfter)
          hoverIndex++;
      }
    }

    this.setState(update(this.state, {
      cards: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard]
        ]
      }
    }));  
  }

  moveCardInList(dragCardId, newStatus) {
    const { cards } = this.state;
    const dragIndex = this.getIndexByCardId(dragCardId);
    let dragCard = update(cards[dragIndex], {
      status: {$set: newStatus}
    });

    this.setState(update(this.state, {
      cards: {
        $splice: [
          [dragIndex, 1],
          [cards.length, 0, dragCard]
        ]
      }
    }));  
  }

  persistCardDrag (cardId, status) {
    let cardIndex = this.state.cards.findIndex((card)=>card.id === cardId);
    let card = this.state.cards[cardIndex];
    
    this.database.saveAllCards(this.state.cards,
      () => {
        this.setState(
          update(this.state, {
            cards: {
              [cardIndex]: {
                status: { $set: status }
              }
            }
          })
        )
      }
    );
  }

  addCard(card) {
    let prevState = this.state;
    let nextState = update(this.state.cards, {$push: [card]});
    this.database.addCard(card, nextState.length - 1,
      () => this.setState(prevState)
    );
    this.setState({cards: nextState});
  }
 
  updateCard(card) {
    let prevState = this.state;
    let cardIndex = this.state.cards.findIndex((c)=>c.id === card.id);
    let nextCardsState = update(
        this.state.cards, {
            [cardIndex]: {$set: card}
        });
    this.database.setCard(card, cardIndex,
      () => this.setState(prevState)
    );
    this.setState({cards: nextCardsState});
  }

  removeCard(cardId) {
    let prevState = this.state;
    let cardIndex = this.state.cards.findIndex((c)=>c.id === cardId);  
    let nextState = update(
      this.state, {
        cards: {
          $splice: [[cardIndex, 1],]
        }
      }
    );
    this.database.saveAllCards(nextState.cards,
      () => this.setState(prevState)
    );
    this.setState(nextState);
  }

  addBoard(boardName) {
    let prevState = this.state;

    let newBoardNames = this.state.boardNames.slice();
    newBoardNames.push(boardName);
    this.setState({
      selectedBoardName: boardName,
      cards: [],
      boardNames: newBoardNames
    });

    this.database.addBoard(boardName, () => {
      this.setState(prevState);
    });
  }

  removeBoard(boardName) {
    let prevState = this.state;

    let newBoardNames = this.state.boardNames.slice();
    newBoardNames.splice(newBoardNames.indexOf(boardName), 1);
    this.setState({
      boardNames: newBoardNames
    });

    this.database.removeBoard(
      boardName,
      () => {
        this.selectBoard(newBoardNames[0]);
      },
      (error) => {
        this.setState(preState);
      }
    );
  }

  selectBoard(boardName) {
    this.database.selectBoard(boardName);

    this.database.getCardsByBoardName(boardName, (cards) => {
      this.setState({
        cards: cards,
        selectedBoardName: boardName
      });
    });
  }

  render() {
    let kanbanBoard = this.props.children && React.cloneElement(this.props.children, {
      cards: this.state.cards,
      taskCallbacks:{
        toggle: this.toggleTask.bind(this),
        delete: this.deleteTask.bind(this),
        add: this.addTask.bind(this)
      },
      cardCallbacks:{
        addCard: this.addCard.bind(this),
        updateCard: this.updateCard.bind(this),
        removeCard: this.removeCard.bind(this),
        moveCard: this.moveCard.bind(this),
        persistCardDrag: this.persistCardDrag.bind(this)
      },
      boardCallbacks: {
        addBoard: this.addBoard.bind(this),
        removeBoard: this.removeBoard.bind(this),
        selectBoard: this.selectBoard.bind(this)
      },
      boards: this.state.boardNames,
      selectedBoard: this.state.selectedBoardName,
      moveCardInList: this.moveCardInList.bind(this)
    });
    return kanbanBoard;
  }
}

export default KanbanBoardContainer;