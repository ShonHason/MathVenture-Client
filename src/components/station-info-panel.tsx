import { Card } from "./ui/card";
import "./station-info-panel.css";

interface Station {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface StationInfoPanelProps {
  station: Station;
  totalStations: number;
}

export default function StationInfoPanel({ station, totalStations }: StationInfoPanelProps) {
  return (
    <div className="info-panel-container">
      <Card className="info-panel">
        <div className={`info-panel-header info-panel-${station.color}`}>
          <div className="info-panel-title">
            <span className="info-panel-icon">{station.icon}</span>
            <span>תחנה {station.id}</span>
          </div>
          <div className="info-panel-badge">Current Stop</div>
        </div>

        <div className="info-panel-content">
          <h3 className="info-panel-name">{station.name}</h3>
          <p className="info-panel-description">{station.description}</p>

          <div className="info-panel-details">
            <div className="info-panel-detail">
              <div className="info-panel-detail-text">
                <span className="info-panel-detail-label">מה צפוי בתחנה זו:</span>
                <ul className="info-panel-list">
                  <li>📘 הסבר קצר על מונחי יסוד</li>
                  <li>🧠 תרגול קל להבנה</li>
                  <li>❓ 15 שאלות אינטראקטיביות</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="info-panel-progress">
            <div className="progress-label">
              ההתקדמות שלך: {station.id} מתוך {totalStations}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(station.id / totalStations) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
