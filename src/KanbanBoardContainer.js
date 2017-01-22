import React, {Component} from 'react';
import KanbanBoard from './KanbanBoard';
import DatabaseController from './DatabaseController';
import update from 'react-addons-update';
import 'whatwg-fetch';
import 'babel-polyfill';
//import {throttle} from './utils';

class KanbanBoardContainer extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      cards: []
    };
    this.updateCardStatus = this.updateCardStatus.bind(this);//throttle(this.updateCardStatus.bind(this));
    this.updateCardPosition = this.updateCardPosition.bind(this);//throttle(this.updateCardPosition.bind(this),500);
  }

  componentDidMount() {
    this.database = new DatabaseController();
    var localData = this.database.getDataFromLocalStorage();
    this.setState({cards: localData});
    this.database.connect();
    this.database.getDataFromServer(
      (data) => {
        this.setState({cards: data}); 
      }
    );

    window.onbeforeunload = () => {
      this.database.saveDataToLocalStorage(this.state.cards);
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

  updateCardStatus(cardId, listId) {
    // Find the index of the card
    let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
    // Get the current card
    let card = this.state.cards[cardIndex];
    // Only proceed if hovering over a different list
    if (card.status !== listId) {
      // set the component state to the mutated object
      this.setState(update(this.state, {
        cards: {
          [cardIndex]: {
            status: {$set: listId}
          }
        }
      }));
    }
  }
 
  updateCardPosition(cardId, afterId) {
    if (cardId !== afterId) {
      // Find the index of the card
      let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
      // Get the current card
      let card = this.state.cards[cardIndex];
      // Find the index of the card the user is hovering over
      let afterIndex = this.state.cards.findIndex((card)=>card.id == afterId);
      // Use splice to remove the card and reinsert it a the new index
      this.setState(update(this.state, {
        cards: {
          $splice: [
            [cardIndex, 1],
            [afterIndex, 0, card]
          ]
        }
      }));
    }
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
    let nextState = update(
        this.state.cards, {
            [cardIndex]: {$set: card}
        });
    this.database.setCard(card, cardIndex,
      () => this.setState(prevState)
    );
    this.setState({cards: nextState});
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
        updateStatus: this.updateCardStatus.bind(this),
        updatePosition: this.updateCardPosition.bind(this),
        persistCardDrag: this.persistCardDrag.bind(this)
      }
    });
    return kanbanBoard;
  }
}

export default KanbanBoardContainer;