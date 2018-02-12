import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classNames from 'classnames';
import nav from 'constants/nav';

// give sidebar the router so we can know which route to highlight
const Sidebar = withRouter(({ isLoggedIn, location }) => {
  // Don't show unusable sidebar elements
  const navElements = nav.main.filter(({ needsLogin }) => isLoggedIn || !needsLogin);
  const getCurrentRoute = (section) => section.url === location.pathname && 'selected';
  const showSidebar = location.pathname !== '/';

  return (
    <ReactCSSTransitionGroup
      transitionName='slide'
      transitionEnterTimeout={500}
      transitionLeaveTimeout={300}
    >
      {showSidebar &&
        <div className={classNames('leftNavBar', 'slideLeft')} key='sidebar' >
          {navElements.map((section, index) =>
            <div className={classNames('leftNav', getCurrentRoute(section))} key={`nav-${index}`}>
              <Link to={section.url}><div className='navigation'>{section.title}</div></Link>
            </div>
          )}
        </div>
      }
    </ReactCSSTransitionGroup>
  );
});

export default Sidebar;