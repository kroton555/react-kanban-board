import React from 'react';
import {render} from 'react-dom';
import {browserHistory, Router, Route } from 'react-router';
import KanbanBoardContainer from './KanbanBoardContainer';
import KanbanBoard from './KanbanBoard';
import EditCard from './EditCard';
import NewCard from './NewCard';
import constants from './constants';
 
render((
  <Router history={browserHistory}>
    <Route component={KanbanBoardContainer}>
      <Route path={constants.SITE_ROOT} component={KanbanBoard}>
        <Route path={constants.SITE_ROOT + "new"} component={NewCard} />
        <Route path={constants.SITE_ROOT + "edit/:card_id"} component={EditCard} />
      </Route>
    </Route>
  </Router>
  ), 
  document.getElementById('root')
);

