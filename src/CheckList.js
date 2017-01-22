import React, {Component, PropTypes} from 'react';

class CheckList extends Component {
  checkInputKeyPress(evt) {
    if(evt.key === 'Enter') {
      this.props.taskCallbacks.add(this.props.cardId, evt.target.value);
      evt.target.value = '';
    }
  }

  render() {
    let tasks = this.props.tasks.map((task, taskIndex) => (
      <li key={task.id} className="checklist__task">
        <label className={"checklist__task-label" + (task.done ? " checklist__task-label--done" : "")}>
          <input 
            type="checkbox" 
            defaultChecked={task.done}
            onChange={this.props.taskCallbacks.toggle.bind(null, this.props.cardId, task.id, taskIndex)}
          />
          <i className={"icon " + (task.done ? "icon-check-square" : "icon-square")}></i>
          {task.name}
        </label>        
        <i 
          className="checklist__task-remove icon icon-close"
          onClick={this.props.taskCallbacks.delete.bind(null, this.props.cardId, task.id, taskIndex)}
        />
      </li>
    ));

    return (
      <div className="checklist">
        <ul>{tasks}</ul>
        <input type="text"
          className="checklist__add-task"
          placeholder="Впишите подзадачу и нажмите Enter" 
          onKeyPress={this.checkInputKeyPress.bind(this)}
        />
      </div>
    );
  }
}

CheckList.propTypes = {
  cardId: PropTypes.string,
  tasks: PropTypes.arrayOf(PropTypes.object),
  taskCallbacks: PropTypes.object
};

export default CheckList;