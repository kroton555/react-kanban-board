import React, {Component, PropTypes} from 'react';
import CardForm from './CardForm';
import constants from './constants';
 
class NewCard extends Component {
  componentWillMount() {
    this.setState({
      id: Date.now(),
      title: '',
      description: '',
      status: 'todo',
      color: '#c9c9c9',
      tasks: []
    });
  }

  handleChange(field, value) {
    this.setState({[field]: value});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.cardCallbacks.addCard(this.state);
    this.props.router.push(constants.SITE_ROOT);
  }

  handleClose(e) {
    this.props.router.push(constants.SITE_ROOT);
  }

  render() {
    return (
      <CardForm draftCard={this.state}
        popupTitle="Добавить карточку"
        buttonLabel="Добавить"
        handleChange={this.handleChange.bind(this)}
        handleSubmit={this.handleSubmit.bind(this)}
        handleClose={this.handleClose.bind(this)}
      />
    );
  }
}

NewCard.propTypes = {
  cardCallbacks: PropTypes.object
};
export default NewCard;