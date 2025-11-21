import React from "react";
import "./Goals.css";
import DashNav from "../../components/DashNav";
function Goals() {
  return (
    <div className="goals pt-20">
      <DashNav />
      <h2>Your Goals</h2>
      <ul>
        <li>Run 5km in under 30 minutes</li>
        <li>Complete a 30-day yoga challenge</li>
        <li>Drink 2 liters of water daily</li>
      </ul>
    </div>
  );
}

export default Goals;
