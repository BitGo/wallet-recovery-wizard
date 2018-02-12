import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import nav from 'constants/nav';

const MainNav = ({ isLoggedIn }) => {
  const getDisabled = (section) => section.needsLogin && !isLoggedIn && 'disabled';

  return (
    <div>
      <h1 className='content-header'>What would you like to do?</h1>
      {nav.main.map((section, index) =>
        <Link to={section.url} key={`main-nav-${index}`}>
          <div className={classNames('optionBox', getDisabled(section))}>
            <h2 className='optionBox-title'>{section.title}</h2>
            <p>{section.description}</p>
          </div>
        </Link>
      )}
    </div>
  );
};

export default MainNav;