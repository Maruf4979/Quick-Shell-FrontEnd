import React, { useState, useEffect } from "react";
import "./App.css";

// // Import images
import urgentIcon from "./assets/icons/SVG - Urgent Priority grey.svg";
import highIcon from "./assets/icons/Img - High Priority.svg";
import mediumIcon from "./assets/icons/Img - Medium Priority.svg";
import lowIcon from "./assets/icons/Img - Low Priority.svg";
import noPriorityIcon from "./assets/icons/No-priority.svg";
import todoIcon from "./assets/icons/To-do.svg";
import inProgressIcon from "./assets/icons/in-progress.svg";
import doneIcon from "./assets/icons/Done.svg";
import backlogIcon from "./assets/icons/Backlog.svg";
import add from "./assets/icons/add.svg";
import img1 from "./assets/icons/web1.jpg";

// API URL
const API_URL = "https://api.quicksell.co/v1/internal/frontend-assignment";

// Mappings for priority levels to human-readable strings
const priorityMapping = {
  4: "Urgent",
  3: "High",
  2: "Medium",
  1: "Low",
  0: "No priority",
};

// Mapping status to icons
const statusMapping = {
  Todo: todoIcon,
  "In progress": inProgressIcon,
  Done: doneIcon,
  Backlog: backlogIcon,
};

// Mapping priority levels to icons
const priorityIconMapping = {
  4: urgentIcon,
  3: highIcon,
  2: mediumIcon,
  1: lowIcon,
  0: noPriorityIcon,
};

// Define the custom priority order (reversed)
const priorityOrder = [0, 4, 3, 2, 1];

// Ticket component
const Ticket = ({ ticket, users }) => {
  const { id, title, tag, status, priority, userId } = ticket;

  // Find the user by userId
  const user = users.find((user) => user.id === userId);
  const userImg = user ? user.img : ""; // Get user's image or set a default image

  return (
    <div key={id} className={`ticket priority-${priority}`}>
      {/* Ticket Header */}
      <div className="ticket-header-1">
        <div>{id}</div>
        {/* Display user image dynamically */}
        <img src={userImg} alt={user?.name || "User"} className="left-img" />
      </div>

      {/* Ticket Title Section */}
      <div className="ticket-header">
        {/* Display status icon dynamically */}
        <img src={statusMapping[status]} alt={status} className="status-icon" />
        <h3>{title}</h3>
      </div>

      {/* Ticket Footer */}
      <div className="ticket-footer">
        {/* Display priority icon dynamically */}
        <img
          src={priorityIconMapping[priority]}
          alt={priorityMapping[priority]}
          className="priority-icon"
        />
        <div>
          {/* Display tag */}
          <div className="tag0"></div>
          <span className="tag">{tag[0]}</span>
        </div>
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState("status");
  const [ordering, setOrdering] = useState("priority");
  const [groupedTickets, setGroupedTickets] = useState({});
  const [controlsVisible, setControlsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tickets and users data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setTickets(data.tickets || []);
        setUsers(data.users || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const groupTickets = () => {
      let grouped = {};
      if (grouping === "status") {
        grouped = tickets.reduce((acc, ticket) => {
          const key = ticket.status;
          acc[key] = acc[key] || [];
          acc[key].push(ticket);
          return acc;
        }, {});
      } else if (grouping === "user") {
        grouped = tickets.reduce((acc, ticket) => {
          const key = ticket.userId;
          acc[key] = acc[key] || [];
          acc[key].push(ticket);
          return acc;
        }, {});
      } else if (grouping === "priority") {
        grouped = tickets.reduce((acc, ticket) => {
          const key = priorityMapping[ticket.priority];
          acc[key] = acc[key] || [];
          acc[key].push(ticket);
          return acc;
        }, {});
      }
      setGroupedTickets(grouped);
    };

    groupTickets();
  }, [grouping, tickets]);

  const sortedTickets = (ticketList) => {
    if (ordering === "priority") {
      return [...ticketList].sort((a, b) => b.priority - a.priority);
    } else if (ordering === "title") {
      return [...ticketList].sort((a, b) => a.title.localeCompare(b.title));
    }
    return ticketList;
  };

  const getUserDetails = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? { name: user.name, img: user.img } : {};
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="kanban-board">
      <button
        className="display-controls-btn"
        onClick={() => setControlsVisible(!controlsVisible)}
      >
        Display Controls
      </button>

      {controlsVisible && (
        <div className="controls">
          <div className="cnt-1">
            <label>Grouping:</label>
            <select onChange={(e) => setGrouping(e.target.value)} value={grouping}>
              <option value="status">Status</option>
              <option value="user">User</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <div className="cnt-1">
            <label>Ordering:</label>
            <select onChange={(e) => setOrdering(e.target.value)} value={ordering}>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      )}

      <div className="board-columns">
        {Object.keys(groupedTickets)
          .sort((a, b) => {
            const priorityA = Object.keys(priorityMapping).find(
              (key) => priorityMapping[key] === a
            );
            const priorityB = Object.keys(priorityMapping).find(
              (key) => priorityMapping[key] === b
            );

            return priorityOrder.indexOf(Number(priorityA)) - priorityOrder.indexOf(Number(priorityB));
          })
          .map((group) => {
            const isUserGrouping = grouping === "user";
            const isPriorityGrouping = grouping === "priority";
            const userDetails = isUserGrouping ? getUserDetails(group) : {};
            return (
              <div key={group} className="column">
                <div className="column-header">
                  <div className="left-side">
                    {isPriorityGrouping ? (
                      <img
                        src={
                          priorityIconMapping[
                            Object.keys(priorityMapping).find((key) => priorityMapping[key] === group)
                          ] || noPriorityIcon
                        }
                        alt={group}
                        className="left-img"
                      />
                    ) : isUserGrouping && userDetails.img ? (
                      <img src={userDetails.img} alt={userDetails.name} className="left-img" />
                    ) : (
                      <img src={statusMapping[group] || img1} alt={group} className="left-img" />
                    )}
                    <h5>
                      {isUserGrouping ? userDetails.name : isPriorityGrouping ? group : group}{" "}
                      <span className="count">{groupedTickets[group].length} </span>
                    </h5>
                  </div>
                  <div className="right-side">
                    <img src={add} alt="Add" className="right-img" />
                    <img src={noPriorityIcon} alt="No priority" className="right-img" />
                  </div>
                </div>
                {sortedTickets(groupedTickets[group]).map((ticket) => (
                  <Ticket key={ticket.id} ticket={ticket} users={users} />
                ))}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default KanbanBoard;
