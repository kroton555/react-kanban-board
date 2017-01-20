import React from 'react';
import {render} from 'react-dom';
import {browserHistory, Router, Route } from 'react-router';
import KanbanBoardContainer from './KanbanBoardContainer';
import KanbanBoard from './KanbanBoard';
import EditCard from './EditCard';
import NewCard from './NewCard';
 
render((
  <Router history={browserHistory}>
    <Route component={KanbanBoardContainer}>
      <Route path="/react-kanban-board/dist/" component={KanbanBoard}>
        <Route path="/react-kanban-board/dist/new" component={NewCard} />
        <Route path="edit/:card_id" component={EditCard} />
      </Route>
    </Route>
  </Router>
  ), 
  document.getElementById('root')
);

