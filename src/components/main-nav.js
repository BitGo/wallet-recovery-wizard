import React from 'react';
import { Link } from 'react-router-dom';

import nav from 'constants/nav';

const MainNav = ({ isLoggedIn }) => {
  const linkUrl = (section) => section.needsLogin && !isLoggedIn ? '/' : section.url;

  return (
    <div>
      <h1 className='content-header'>What would you like to do?</h1>
      {nav.main.map((section, index) =>
        <Link to={linkUrl(section)} key={`main-nav-${index}`}>
          <div className="optionBox">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </div>
        </Link>
      )}
    </div>
  );
};

export default MainNav;