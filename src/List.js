import React, {Component, PropTypes} from 'react';
import { DropTarget } from 'react-dnd';
import Card from './Card';
import constants from './constants';

const listTargetSpec = {
  hover(props, monitor, component) {
    if (monitor.isOver({ shallow: true })) {
      let item = monitor.getItem();
      if (item.status === props.id)
        return;

      item.status = props.id;
      item.index = props.cards.length;
      props.moveCardInList(item.id, props.id);
    }
  }
};
 
function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    draggedItem: monitor.getItem()
  };
}

class List extends Component {
  render() {
    const { connectDropTarget, draggedItem } = this.props;
    
    var cards = this.props.cards.map((card, i) => {
      return <Card
        key={card.id} 
        id={card.id}
        index={i}
        status={card.status}
        title={card.title}
        color={card.color}
        description={card.description}
        tasks={card.tasks}
        taskCallbacks={this.props.taskCallbacks}
        cardCallbacks={this.props.cardCallbacks} />
    });

    let listContentClass = "list__content" + 
      (draggedItem ? " list__content--dragging" : "");

    return (
      <div className="list">
        <h1 className="list__title">{this.props.title}</h1>
        {connectDropTarget(<div className={listContentClass}>          
          {cards.length ? 
            cards :
            <div className="card__wrapper"> 
              <div className="card card--placeholder">Нет задач</div>
            </div>
          }
        </div>)}
      </div>
    );
  }
}

List.propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    draggedItem: PropTypes.object,
    id: PropTypes.any.isRequired,
    title: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(PropTypes.object),
    taskCallbacks: PropTypes.object,
    cardCallbacks: PropTypes.object,
    moveCardInList: PropTypes.func.isRequired    
};

export default DropTarget(constants.CARD, listTargetSpec, collect)(List);