import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import nav from 'constants/nav';

const MainNav = ({ isLoggedIn }) => {
  const isDisabled = (section) => section.needsLogin && !isLoggedIn;
  const getDisabled = (section) => isDisabled(section) && 'disabled';

  return (
    <div>
      <h1 className='content-header'>What would you like to do?</h1>
      {nav.main.map((section, index) =>
        <NavBoxContent isDisabled={isDisabled(section)} section={section}>
          <div className={classNames('optionBox', getDisabled(section))}>
            <h2 className='optionBox-title'>{section.title}</h2>
            <p>{section.description}</p>
          </div>
        </NavBoxContent>
      )}
    </div>
  );
};

const NavBoxContent = ({ isDisabled, children, section }) => {
  if (isDisabled) {
    return <div>{children}</div>;
  }

  return <Link to={section.url}>{children}</Link>;
};


export default MainNav;