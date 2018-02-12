import React from 'react';
import { Link } from 'react-router-dom';
import nav from 'constants/nav';

const Sidebar = ({ isLoggedIn }) => {
  // Don't show unusable sidebar elements
  const navElements = nav.main.filter(({ needsLogin }) => isLoggedIn || !needsLogin);

  return (
    <div className="leftNavBar">
      {navElements.map((section, index) =>
        <div className="leftNav" key={`nav-${index}`}>
          <Link to={section.url}><div className="navigation">{section.title}</div></Link>
        </div>
      )}
    </div>
  );
}

export default Sidebar;