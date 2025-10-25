import React from "react";
import "./Activity.css";
import DashNav from "../../components/DashNav";

function Activity() {
  return (
    <div className="activity">
      <DashNav />
      <h2>Recent Activity</h2>
      <ul>
        <li>Completed a workout session</li>
        <li>Achieved a new personal best</li>
        <li>Joined a new fitness challenge</li>
      </ul>
    </div>
  );
}

export default Activity;
