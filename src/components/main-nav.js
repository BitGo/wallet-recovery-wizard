import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import nav from 'constants/nav';

const MainNav = ({ isLoggedIn }) => {
  const isDisabled = (section) => section.needsLogin && !isLoggedIn;
  const getDisabled = (section) => isDisabled(section) && 'disabled';

  return (
    <div className="content-centered">
      <h1 className="content-header nav-title">What would you like to do?</h1>
      <div className="option-box-container">
        {nav.main.map((section, index) => (
          <NavBoxContent isDisabled={isDisabled(section)} section={section} key={index}>
            <div className={classNames('optionBox', getDisabled(section))}>
              <h2 className="optionBox-title">{section.title}</h2>
              <p>{section.description}</p>
            </div>
          </NavBoxContent>
        ))}
      </div>
    </div>
  );
};

const NavBoxContent = ({ isDisabled, children, section }) => {
  if (isDisabled) {
    return children;
  }

  return <Link to={section.url}>{children}</Link>;
};

export default MainNav;
