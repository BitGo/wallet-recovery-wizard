import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import classNames from 'classnames';
import nav from 'constants/nav';

// give sidebar the router so we can know which route to highlight
const Sidebar = withRouter(({ isLoggedIn, location }) => {
  // Don't show unusable sidebar elements
  const navElements = nav.main.filter(({ needsLogin }) => isLoggedIn || !needsLogin);
  const getCurrentRoute = (section) => section.url === location.pathname && 'selected';

  return (
    <div className='leftNavBar'>
      {navElements.map((section, index) =>
        <div className={classNames('leftNav', getCurrentRoute(section))} key={`nav-${index}`}>
          <Link to={section.url}><div className='navigation'>{section.title}</div></Link>
        </div>
      )}
    </div>
  );
});

export default Sidebar;