import React, {Component, PropTypes} from 'react';
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

const cardDropSpec = {
  hover(props, monitor) {
    const draggedId = monitor.getItem().id;
    props.cardCallbacks.updatePosition(draggedId, props.id);
  }
};

let collectDrop = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget()
  };
};


const cardDragSpec = {
  beginDrag(props) {
    return {
      id: props.id,
      status: props.status
    };
  },
  endDrag(props) {
    props.cardCallbacks.persistCardDrag(props.id, props.status);
  }
};

let collectDrag = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource()
  };
};
 
class Card extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      showDetails: false
    };
  }

  toggleDetails() {
    this.setState({showDetails: !this.state.showDetails});
  }

  removeCard() {
    this.props.cardCallbacks.removeCard(this.props.id);
  }

  render() {
    const { connectDragSource, connectDropTarget } = this.props;

    let cardDetails;
    if (this.state.showDetails) {
      cardDetails = (
        <div className="card__details">
        <span dangerouslySetInnerHTML={{__html:marked(this.props.description)}} />
        <CheckList cardId={this.props.id} tasks={this.props.tasks} taskCallbacks={this.props.taskCallbacks}/>
        </div>
      )
    }

    let sideColor = {backgroundColor: this.props.color};
    let showDetails = this.state.showDetails;

    return connectDropTarget(connectDragSource(
      <div className="card">
        <div className="card__side-color" style={sideColor}/>
        <div className="card__icon card__icon--edit">
          <Link className="icon icon-pencil" to={constants.SITE_ROOT + 'edit/'+this.props.id}></Link>
        </div>
        <div 
          className="card__icon card__icon--remove icon icon-close"
          onClick={this.removeCard.bind(this)}
        />
        <div
          className={"card__title" + (showDetails ? " card__title--is-open" : "")}
          onClick={this.toggleDetails.bind(this)}
        >
          <i className={"icon " + (showDetails ? "icon-caret-down" : "icon-caret-right")}></i>
          {this.props.title}
        </div>

        {cardDetails}
      </div>
    ))
  }
}
 
Card.propTypes = {
  id: PropTypes.string,
  title: titlePropType,
  description: PropTypes.string,
  color: PropTypes.string,
  tasks: PropTypes.arrayOf(PropTypes.object),
  taskCallbacks: PropTypes.object,
  cardCallbacks: PropTypes.object,
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired
};
 
const dragHighOrderCard = DragSource(constants.CARD, cardDragSpec, collectDrag)(Card);
const dragDropHighOrderCard = DropTarget(constants.CARD, cardDropSpec, collectDrop)(dragHighOrderCard);
export default dragDropHighOrderCard;


