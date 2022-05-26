import { Icon } from "@blueprintjs/core";
import React from "react";
import { NavLink } from "react-router-dom";
import BuildUnsignedSweepForm from "../../components/build-unsigned-sweep-form/build-unsigned-sweep-form";
import { H4 } from "../../modules/lumina/components/H4/h4";

function BuildUnsignedSweep() {
  return (
    <div className="flex flex-column flex-grow-1 overflow-auto">
      <div className="flex items-center w-100 l-gpl l-gpr pv3 bb b--border">
        <H4 mbx="" className="truncate flex-grow-1">
          Build Unsigned Sweep
        </H4>

        <NavLink
          className="fw5 l-appSideNavigation-link bp3-button bp3-minimal bp3-button--square"
          to="/"
        >
          <Icon icon="cross" />
        </NavLink>
      </div>
      <BuildUnsignedSweepForm />
    </div>
  );
}

export default BuildUnsignedSweep;
