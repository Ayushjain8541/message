import React, { useState, useEffect } from "react";
import "tailwindcss";
import './App.css';


function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    const response = await fetch("http://localhost:8000/messages");
    const data = await response.json();
    setMessages(data.messages);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (response.ok) {
      setMessage("");
      fetchMessages();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Message Board
        </h1>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message"
            className="flex-grow border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Submit
          </button>
        </form>
  
        <div>
          <h2 className="text-lg font-semibold mb-3">Messages:</h2>
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet!</p>
          ) : (
            messages.map((msg, index) => {
              console.log("Message object:", msg);
              return (
                <div
                  key={msg.id || index}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-md mb-2"
                >
                  <p className="text-gray-800">{msg.text}</p>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
  
}

export default App;


