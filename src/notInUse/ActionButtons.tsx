/*import React from "react";
import ToggleSwitch from "./ToggleSwitch";
import "./ActionButtons.css";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useActionButtons } from "../context/ActionButtonsContext";
interface ActionButtonsProps {
  scanning: boolean;
  onScan: () => void;
  onClear: () => void;
  isKeyboard: boolean;
  setIsKeyboard: (isKeyboard: boolean) => void;
  fullScreen?: boolean;
  setFullScreen?: (isFullScreen: boolean) => void;
}
const ActionButtons: React.FC<ActionButtonsProps> = ({
  scanning,
  onScan,
  onClear,
  isKeyboard,
  setIsKeyboard,
  fullScreen,
  setFullScreen,
}) => {
  const onFullScreen = () => {
    if (setFullScreen) {
      setFullScreen(!fullScreen);
    }
  };

  const { triggerScan } = useActionButtons();
  return (
    <>
      <div className="action-buttons">
        <button className="btn clear-btn" onClick={onClear}>
          נקה
        </button>
        <button className="btn scan-btn" onClick={onScan} disabled={scanning}>
          {scanning ? "מזהה…" : "סריקה"}
        </button>
        <ToggleSwitch checked={isKeyboard} onChange={setIsKeyboard} />
        {setFullScreen && (
          <button className="btn fullscreen-btn" onClick={onFullScreen}>
            <FontAwesomeIcon icon={faExpand} />
          </button>
        )}
      </div>
    </>
  );
};

export default ActionButtons;
*/
