import React, {Component, PropTypes} from 'react';
import { findDOMNode } from 'react-dom';
import CheckList from './CheckList';
import marked from 'marked';
import { DragSource, DropTarget } from 'react-dnd';
import constants from './constants';
import {Link} from 'react-router';
 
let titlePropType = (props, propName, componentName) => {
  if (props[propName]) {
    let value = props[propName];
    if (typeof value !== 'string' || value.length > 80) {
      return new Error(
        `${propName} in ${componentName} is longer than 80 characters`
        );
    }
  }
};

const cardDragSpec = {
  beginDrag(props, monitor, component) {
    component.hideDetails();
    return {
      id: props.id,
      index: props.index,
      status: props.status
    };
  },

  isDragging(props, monitor) {
    return props.id === monitor.getItem().id;
  },

  endDrag(props) {
    props.cardCallbacks.persistCardDrag(props.id, props.status);
  }
};

const cardDropSpec = {
  hover(props, monitor, component) {
    const item = monitor.getItem();

    if (props.id === item.id)
      return;

    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    const dragIndex = item.index;
    const hoverIndex = props.index;

    if (item.status !== props.status) {
      var insertAfter = hoverClientY > hoverMiddleY;
      item.index = hoverIndex + (insertAfter ? 1 : 0);
      item.status = props.status;
      props.cardCallbacks.moveCard(item.id, props.id, props.status, insertAfter);     
      return;
    }

    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    props.cardCallbacks.moveCard(item.id, props.id);
    item.index = hoverIndex;
  }
};

let collectDrag = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
};

let collectDrop = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget()
  };
};
 
class Card extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      showDetails: false
    };
  }

  hideDetails() {
    if (this.state.showDetails) {
      this.setState({showDetails: false});
    }
  }

  toggleDetails() {
    this.setState({showDetails: !this.state.showDetails});
  }

  removeCard() {
    this.props.cardCallbacks.removeCard(this.props.id);
  }

  render() {
    const { connectDragSource, connectDragPreview, connectDropTarget, isDragging } = this.props;

    let cardDetails;
    if (this.state.showDetails) {
      cardDetails = (
        <div className="card__details">
          <div className="card__descr" dangerouslySetInnerHTML={{__html:marked(this.props.description)}} />
          <CheckList 
            cardId={this.props.id} 
            tasks={this.props.tasks} 
            taskCallbacks={this.props.taskCallbacks}
          />
        </div>
      )
    }

    let sideColor = {backgroundColor: this.props.color};
    let showDetails = this.state.showDetails;
    let cardClass = "card" + (isDragging ? " card--dragging" : "");
    let cardTitleClass = "card__title" + (showDetails ? " card__title--is-open" : "");

    return connectDropTarget(connectDragPreview(
      <div className="card__wrapper">
        <div className={cardClass}>

          {connectDragSource(
          <div className="card__header" style={sideColor}>
            <div className="card__icon card__icon--edit">
              <Link 
                className="icon icon-pencil" 
                to={constants.SITE_ROOT + 'edit/'+this.props.id}>
              </Link>
            </div>
            
            <div 
              className="card__icon card__icon--remove icon icon-close"
              onClick={this.removeCard.bind(this)}
            />
  
            <div className={cardTitleClass} onClick={this.toggleDetails.bind(this)}>
              <i className={"icon " + (showDetails ? "icon-caret-down" : "icon-caret-right")}></i>
              {this.props.title}
            </div>
          </div>
          )}
 
          {cardDetails}
        </div>
      </div>
    ))
  }
}
 
Card.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  id: PropTypes.string,
  status: PropTypes.any.isRequired,
  index: PropTypes.number.isRequired,
  title: titlePropType,
  description: PropTypes.string,
  color: PropTypes.string,
  tasks: PropTypes.arrayOf(PropTypes.object),
  taskCallbacks: PropTypes.object,
  cardCallbacks: PropTypes.object  
};
 
const dragHighOrderCard = DragSource(constants.CARD, cardDragSpec, collectDrag)(Card);
const dragDropHighOrderCard = DropTarget(constants.CARD, cardDropSpec, collectDrop)(dragHighOrderCard);
export default dragDropHighOrderCard;


