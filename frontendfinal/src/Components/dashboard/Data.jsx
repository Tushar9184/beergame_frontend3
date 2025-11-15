import React from "react";

// --- CONFIGURATION ---
// This should match your backend GameConfig.GAME_WEEKS
const TOTAL_WEEKS = 25;
// --- END CONFIGURATION ---

/**
 * The new Week Timeline component
 */
function WeekTimeline({ currentWeek, festiveWeeks = [] }) {
  // Create an array of numbers from 1 to TOTAL_WEEKS
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  return (
    <div className="week-timeline-container">
      <h3 className="week-timeline-title">Game Timeline</h3>
      <div className="week-timeline-scrollbox">
        {weeks.map((weekNum) => {
          // Determine the style of the circle
          let className = "week-circle";
          if (weekNum < currentWeek) {
            className += " past-week";
          }
          if (weekNum === currentWeek) {
            className += " active-week";
          }
          // ✅ Use the list from your backend!
          if (festiveWeeks.includes(weekNum)) {
            className += " festive-week";
          }

          return (
            <div key={weekNum} className={className} title={`Week ${weekNum}`}>
              {weekNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The main Data component
 */
export default function Data({ week, cost, demand, myOrder, festiveWeeks }) {
  console.log("Data component received festiveWeeks:", festiveWeeks);
  return (
    <>
    
      {/* 1. The 4 Stats Boxes (no changes) */}
      <div className="data-container">
        {/* Current Week */}
        <div className="data-box">
          <div className="icon-wrapper week">
            <span>🗓️</span>
          </div>
          <div className="data-text">
            <p>Current Week</p>
            <h2>{week}</h2>
          </div>
        </div>

        {/* Total Cost */}
        <div className="data-box">
          <div className="icon-wrapper cost">
            <span>💰</span>
          </div>
          <div className="data-text">
            <p>Total Cost</p>
            <h2>${cost}</h2>
          </div>
        </div>

        {/* Your Incoming Order */}
        <div className="data-box">
          <div className="icon-wrapper order">
            <span>📥</span>
          </div>
          <div className="data-text">
            <p>customer Demand</p>
            <h2>{myOrder} units</h2>
          </div>
        </div>

        {/* Customer Demand */}
        <div className="data-box">
          <div className="icon-wrapper demand">
            <span>📈</span>
          </div>
          <div className="data-text">
            <p>Customer Demand</p>
            <h2>{demand} units</h2>
          </div>
        </div>
      </div>

      {/* 2. The New Week Timeline */}
      <WeekTimeline currentWeek={week} festiveWeeks={festiveWeeks} />
    </>
  );
}