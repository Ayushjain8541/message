import React, { useState, useEffect } from "react";
import './App.css';
import OrderList from "./components/orderlist";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeView, setActiveView] = useState("messages");
  const [drivers, setDrivers] = useState([]);
  const [newDriver, setNewDriver] = useState({ name: "", phone: "" });

  const fetchMessages = async () => {
    try {
      const response = await fetch("http://localhost:8000/messages");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch("http://localhost:8000/drivers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDrivers(data.drivers || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      alert(`Failed to fetch drivers: ${error.message}`);
    }
  };

  const updateDriverStatus = async (driverId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/drivers/${driverId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchDrivers();
      } else {
        console.error("Error updating driver status");
      }
    } catch (error) {
      console.error("Error updating driver status:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchDrivers();
    // Set up polling for driver status updates
    const interval = setInterval(() => {
      fetchDrivers();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const response = await fetch("http://localhost:8000/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });

    if (response.ok) {
      setMessage("");
      fetchMessages();
      setActiveView("messages");
    } else {
      console.error("Error submitting message");
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error("Message ID is missing.");
      return;
    }
    const response = await fetch(`http://localhost:8000/messages/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      fetchMessages();
    } else {
      console.error("Error deleting message");
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!newDriver.name.trim() || !newDriver.phone.trim()) {
      alert("Please enter both name and phone number");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: newDriver.name.trim(),
          phone: newDriver.phone.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNewDriver({ name: "", phone: "" });
      await fetchDrivers(); // Refresh the drivers list
    } catch (error) {
      console.error("Error adding driver:", error);
      alert(`Failed to add driver: ${error.message}`);
    }
  };

  const handleDeleteDriver = async (id) => {
    const response = await fetch(`http://localhost:8000/drivers/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      fetchDrivers();
    } else {
      console.error("Error deleting driver");
    }
  };

  const handleAssignDriver = async (orderId, driverId) => {
    const response = await fetch(`http://localhost:8000/messages/${orderId}/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ driverId }),
    });

    if (response.ok) {
      fetchMessages();
    } else {
      console.error("Error assigning driver");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #111827, #1f2937, #18181b)",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <header className="glass" style={{ padding: "1rem 0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontWeight: "bold" }}>Order Board</h1>
          <div style={{ display: "none" }}>
            <span style={{ 
              fontSize: "0.75rem", 
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "0.25rem 1rem",
              borderRadius: "9999px"
            }}>Community Space</span>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div className="container">
          <div className="menu-tabs">
            <button
              className={`nav-tab ${activeView === "messages" ? "active" : ""}`}
              onClick={() => setActiveView("messages")}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                View Orders
              </span>
            </button>
            <button
              className={`nav-tab ${activeView === "post" ? "active" : ""}`}
              onClick={() => setActiveView("post")}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Post a Order
              </span>
            </button>
            <button
              className={`nav-tab ${activeView === "drivers" ? "active" : ""}`}
              onClick={() => setActiveView("drivers")}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Manage Drivers
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ flexGrow: 1, padding: "1.5rem 0" }}>
        {/* Post Message Section */}
        {activeView === "post" && (
          <div className="card hover-lift" style={{ maxWidth: "32rem", margin: "0 auto" }}>
            <h2 style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.25rem", width: "1.25rem", marginRight: "0.5rem", color: "#60a5fa" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Post a Order
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What order would you like to post?"
                  style={{ width: "100%" }}
                  rows="4"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.25rem", width: "1.25rem", marginRight: "0.5rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Post Order
              </button>
            </form>
          </div>
        )}

        {/* Drivers Management Section */}
        {activeView === "drivers" && (
          <div>
            <h2 style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.25rem", width: "1.25rem", marginRight: "0.5rem", color: "#60a5fa" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Manage Drivers
            </h2>

            {/* Add Driver Form */}
            <div className="card hover-lift" style={{ marginBottom: "1.5rem" }}>
              <form onSubmit={handleAddDriver} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <input
                    type="text"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    placeholder="Driver Name"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="tel"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    placeholder="Phone Number"
                    style={{ flex: 1 }}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Driver
                </button>
              </form>
            </div>

            {/* Drivers List */}
            <div className="card">
              <h3 style={{ marginBottom: "1rem" }}>Current Drivers</h3>
              {drivers.length === 0 ? (
                <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>No drivers added yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="message-card"
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ 
                          width: "0.75rem", 
                          height: "0.75rem", 
                          borderRadius: "50%", 
                          backgroundColor: 
                            driver.status === "busy" ? "#ef4444" : 
                            driver.status === "offline" ? "#6b7280" : 
                            "#22c55e"
                        }} />
                        <div>
                          <h4 style={{ margin: 0 }}>{driver.name}</h4>
                          <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)" }}>
                            {driver.phone}
                          </p>
                          <p style={{ 
                            margin: "0.25rem 0 0", 
                            fontSize: "0.75rem", 
                            color: 
                              driver.status === "busy" ? "#ef4444" : 
                              driver.status === "offline" ? "#6b7280" : 
                              "#22c55e",
                            textTransform: "capitalize"
                          }}>
                            {driver.status}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <select
                          value={driver.status}
                          onChange={(e) => updateDriverStatus(driver.id, e.target.value)}
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "white"
                          }}
                        >
                          <option value="free">Free</option>
                          <option value="busy">Busy</option>
                          <option value="offline">Offline</option>
                        </select>
                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="btn btn-danger"
                          style={{ padding: "0.5rem 1rem" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Section */}
        {activeView === "messages" && (
          <div>
            <h2 style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "1.25rem", width: "1.25rem", marginRight: "0.5rem", color: "#60a5fa" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Current Orders
            </h2>
            {messages.length === 0 ? (
    <div className="card empty-state">
      <div className="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "2.5rem", width: "2.5rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 style={{ fontSize: "1.125rem", fontWeight: "500", marginBottom: "0.5rem" }}>No orders yet!</h3>
      <p style={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: "1rem" }}>Be the first to post something!</p>
      <button 
        onClick={() => setActiveView("post")} 
        className="btn btn-secondary"
      >
        Post a Order
      </button>
    </div>
  ) : (
    <div 
      className="messages-container" 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "0.75rem",
        maxHeight: "400px",
        overflowY: "auto",
        paddingRight: "0.5rem"
      }}
    >   
      {messages.map((msg, index) => (
        <div
          key={msg.id || index}
          className="message-card"
        >
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ 
              background: "linear-gradient(to bottom right, #60a5fa, #6366f1)",
              width: "2rem", 
              height: "2rem", 
              borderRadius: "9999px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "white", 
              fontWeight: "bold", 
              textTransform: "uppercase",
              fontSize: "0.875rem",
              marginRight: "0.75rem",
              flexShrink: 0
            }}>
              {msg.content ? msg.content[0].toUpperCase() : '?'}
            </div>
            <div style={{ flexGrow: 1 }}>
              <p style={{ 
                wordWrap: "break-word", 
                overflowWrap: "break-word", 
                whiteSpace: "pre-wrap"
              }}>
                {msg.content}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)" }}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
                  </span>
                  {msg.driver ? (
                    <span style={{ 
                      fontSize: "0.75rem", 
                      color: "#60a5fa",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "0.75rem", width: "0.75rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Assigned to: {msg.driver.name}
                    </span>
                  ) : (
                    <select
                      onChange={(e) => handleAssignDriver(msg.id, e.target.value)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "white"
                      }}
                    >
                      <option value="">Assign Driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(msg.id)}
                  style={{ 
                    fontSize: "0.75rem", 
                    color: "rgba(255, 255, 255, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#fca5a5"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "0.75rem", width: "0.75rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass" style={{ padding: "0.75rem 0", marginTop: "auto" }}>
        <div className="container" style={{ textAlign: "center", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)" }}>
          © 2025 Order Board • A Professional Web Application
        </div>
      </footer>
    </div>
  );
}

export default App;
