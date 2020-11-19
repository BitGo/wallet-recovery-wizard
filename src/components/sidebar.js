import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import nav from 'constants/nav';

// give sidebar the router so we can know which route to highlight
const Sidebar = withRouter(({ isLoggedIn, location }) => {
  // Don't show unusable sidebar elements
  const navElements = nav.main.filter(({ needsLogin }) => isLoggedIn || !needsLogin);
  const getCurrentRoute = (section) => section.url === location.pathname && 'selected';
  const showSidebar = location.pathname !== '/' && !location.pathname.match(/index\.html$/) && isLoggedIn;

  return (
    <TransitionGroup>
      {showSidebar && (
        <CSSTransition classNames="slide" timeout={{ enter: 500, exit: 300 }}>
          <div className={classNames('leftNavBar', 'slideLeft')} key="sidebar">
            {navElements.map((section, index) => (
              <div className={classNames('leftNav', getCurrentRoute(section))} key={`nav-${index}`}>
                <Link to={section.url}>
                  <div className="navigation">{section.title}</div>
                </Link>
              </div>
            ))}
          </div>
        </CSSTransition>
      )}
    </TransitionGroup>
  );
});

export default Sidebar;
