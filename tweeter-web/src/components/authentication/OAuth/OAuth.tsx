import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";

interface Props {
  displayMessage: (text: string) => any;
  name: string;
  iconName: IconName;
}

const OAuth: React.FC<Props> = ({ displayMessage, name, iconName }) => {
  return (
    <button
      type="button"
      className="btn btn-link btn-floating mx-1"
      onClick={() => displayMessage(`${name} registration is not implemented.`)}
    >
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={name + "Tooltip"}>{name}</Tooltip>}
      >
        <FontAwesomeIcon icon={["fab", iconName]} />
      </OverlayTrigger>
    </button>
  );
};

export default OAuth;
