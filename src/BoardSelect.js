import React, {Component, PropTypes} from 'react';

class BoardSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {showList: false};
  }

  toggleList() {
    this.setState({showList: !this.state.showList});
  }

  selectItem(item) {
    if (item !== this.props.selectedBoard)
      this.props.boardCallbacks.selectBoard(item);

    this.toggleList();
  }

  removeItem(item, e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.props.boards.length === 1)
      alert("Невозможно удалить, так как это единственная доска. Хотя бы одна доска должна быть активной.");
    else {
      let res = confirm(`Вы уверены, что хотите удалить доску \"${item}\"?`);
      if (res) {
        this.props.boardCallbacks.removeBoard(item);
      }
    }

    this.toggleList();
  }

  checkAddTaskKeyInput(e) {
    if(e.key === 'Enter') {
      this.props.boardCallbacks.addBoard(e.target.value);
      e.target.value = '';
      this.toggleList();     
    }
  }

  render() {
    const { selectedBoard } = this.props;

    let list;
    if (this.state.showList) {
      let listItems = this.props.boards.map((item, i) => {
        return (
          <li 
            key={i}
            className={"custom-select__item" + (item === selectedBoard ? " active" : "")}
            onClick={this.selectItem.bind(this, item)}
          >
            <div 
              className="custom-select__icon-remove icon icon-close"
              onClick={this.removeItem.bind(this, item)}
            />
            {item}
          </li>
        );
      });

      let addBoardItem = 
        <li key={10000} className="custom-select__item custom-select__item-add-board">
          <input 
            type="text" 
            placeholder="Впишите название новой доски"
            onKeyPress={this.checkAddTaskKeyInput.bind(this)}
          />
        </li>;

      listItems.unshift(addBoardItem);

      list = 
        <ul className="custom-select__list">
          {listItems}
        </ul>;
    }

    return (
      <div className="custom-select">
        <div 
          className="custom-select__title" 
          onClick={this.toggleList.bind(this)}
        >
          {selectedBoard}
          <div className="custom-select__icon-arrow icon icon-caret-down"></div>
        </div>

        {list}
      </div>
    );
  }
}

BoardSelect.PropTypes = {
  boards: PropTypes.array.isRequired,
  selectedBoard: PropTypes.string.isRequired,
  boardCallbacks: PropTypes.object
};

export default BoardSelect;