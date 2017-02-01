import React, {Component, PropTypes} from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {Link} from 'react-router';
import constants from './constants';
import BoardSelect from './BoardSelect';
import List from './List';

class KanbanBoard extends Component {
  render() {
    let cardModal=this.props.children && React.cloneElement(this.props.children, {
          cards: this.props.cards,
          cardCallbacks: this.props.cardCallbacks
      });

    return (
      <div className="kanban-board">
        <header className="header">
          <div className="container-with-paddings clearfix">
            <div className="logo">
              Канбан
            </div>

            <Link to={constants.SITE_ROOT + "new"} className="add-card-btn">
              Добавить карточку
            </Link>
            
            <BoardSelect 
              boards={this.props.boards} 
              selectedBoard={this.props.selectedBoard}
              boardCallbacks={this.props.boardCallbacks}
            />
          </div>
        </header>

        <div className="list-wrapper container">
          <List 
            id='todo' 
            title="Запланировано" 
            taskCallbacks={this.props.taskCallbacks}
            cardCallbacks={this.props.cardCallbacks}
            moveCardInList={this.props.moveCardInList}
            cards={this.props.cards.filter((card) => card.status === "todo")}
          />
          <List 
            id='in-progress' 
            title="В процессе"
            taskCallbacks={this.props.taskCallbacks}
            cardCallbacks={this.props.cardCallbacks}
            moveCardInList={this.props.moveCardInList}
            cards={this.props.cards.filter((card) => card.status === "in-progress")}
          />
          <List 
            id='done' 
            title='Выполнено'
            taskCallbacks={this.props.taskCallbacks}
            cardCallbacks={this.props.cardCallbacks}
            moveCardInList={this.props.moveCardInList}
            cards={this.props.cards.filter((card) => card.status === "done")}
          />
        </div>

        {cardModal}
      </div>
    );
  }
}

KanbanBoard.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object),
  taskCallbacks: PropTypes.object,
  cardCallbacks: PropTypes.object,
  boardCallbacks: PropTypes.object,
  selectedBoard: PropTypes.string,
  boards: PropTypes.arrayOf(PropTypes.string),
  moveCardInList: PropTypes.func.isRequired
};

export default DragDropContext(HTML5Backend)(KanbanBoard);