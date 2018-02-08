import React from 'react';
import { Link } from 'react-router-dom';
import nav from 'constants/nav';

const Sidebar = ({ isLoggedIn }) => {
  const linkUrl = (section) => section.needsLogin && !isLoggedIn ? '/' : section.url;

  return (
    <div className="leftNavBar">
      {nav.main.map((section, index) =>
        <div className="leftNav" key={`nav-${index}`}>
          <Link to={linkUrl(section)}><div className="navigation">{section.title}</div></Link>
        </div>
      )}
    </div>
  );
}

export default Sidebar;