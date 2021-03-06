import React, {Component, PropTypes} from 'react';
import CardForm from './CardForm';
import constants from './constants';
 
class EditCard extends Component {
  componentWillMount() {
    let card = this.props.cards.find(
      (card)=>card.id == this.props.params.card_id);
    this.setState(Object.assign({}, card)/*{...card}*/);
  }

  handleChange(field, value) {
    this.setState({[field]: value});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.cardCallbacks.updateCard(this.state);
    this.props.router.push(constants.SITE_ROOT);
  }

  handleClose(e) {
    this.props.router.push(constants.SITE_ROOT);
  }

  render() {
    return (
      <CardForm draftCard={this.state}
        popupTitle="Редактировать карточку"
        buttonLabel="Редактировать"
        handleChange={this.handleChange.bind(this)}
        handleSubmit={this.handleSubmit.bind(this)}
        handleClose={this.handleClose.bind(this)}
      />
    )
  }
}

EditCard.propTypes = {
  cardCallbacks: PropTypes.object
};
 
export default EditCard;