import React, {Component, PropTypes} from 'react';
 
class CardForm extends Component {
  
  keydownHandle(e) {if (e.keyCode === 27) this.handleClose();}

  componentDidMount() {
    this.keydownHandle = this.keydownHandle.bind(this);
    document.addEventListener('keydown', this.keydownHandle); 
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydownHandle);
  }

  handleChange(field, e) {
    this.props.handleChange(field, e.target.value);
  }
  
  handleClose(e) {
    e && e.preventDefault();
    this.props.handleClose();
  }
  
  render() {
    return (
      <div>
        <div className="popup-card">
          <i 
            className="popup-card__close icon icon-close"
            onClick={this.handleClose.bind(this)}
          />
          <h1 className="popup-card__title">{this.props.popupTitle}</h1>
          <form onSubmit={this.props.handleSubmit.bind(this)}>
            <input 
              type='text'
              value={this.props.draftCard.title}
              onChange={this.handleChange.bind(this,'title')}
              placeholder="Название"
              required={true}
              autoFocus={true}
            />

            <textarea 
              value={this.props.draftCard.description}
              onChange={this.handleChange.bind(this,'description')}
              placeholder="Описание"
              rows='3'
              required={true}
            />

            <label>
              <span>Статус</span>
              <select 
                value={this.props.draftCard.status}
                onChange={this.handleChange.bind(this,'status')}
              >
                <option value="todo">Запланировано</option>
                <option value="in-progress">В процессе</option>
                <option value="done">Выполнено</option>
              </select>
            </label>
            <br />
            <label>
              <span>Цвет</span>
              <input
                type="color" 
                defaultValue={this.props.draftCard.color}
                onChange={this.handleChange.bind(this,'color')}                
              />
            </label>

            <div className='actions'>
              <button type="submit">{this.props.buttonLabel}</button>
            </div>
          </form>
        </div>

        <div 
          className="overlay" 
          onClick={this.handleClose.bind(this)}>
        </div>
      </div>
      );
  }
}
 
CardForm.propTypes = {
    buttonLabel: PropTypes.string.isRequired,
    draftCard: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        status: PropTypes.string,
        color: PropTypes.string
    }).isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired
};
 
export default CardForm;