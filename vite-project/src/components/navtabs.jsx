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