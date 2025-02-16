"use client";

import { useState } from "react";

export default function ChatBox() {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);

    // Handle Sending Message
    const handleSendMessage = async () => {
        if (!query.trim()) return;

        const newMessages = [...messages, { role: "user", text: query }];
        setMessages(newMessages);
        setQuery("");

        try {
            const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: query }), // ✅ Correct
});

            const data = await response.json();
            setMessages([...newMessages, { role: "bot", text: data.reply }]);
        } catch (error) {
            setMessages([...newMessages, { role: "bot", text: "Failed to fetch response." }]);
        }
    };

    return (
        <div 
            className="flex flex-col h-screen items-center justify-center bg-cover bg-center text-white text-center p-6"
            style={{ 
                backgroundImage: "url('/main_cover.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >
            {/* Slogan Section */}
            <h1 className="text-5xl font-extrabold mt-10 max-w-3xl leading-tight tracking-wide text-white drop-shadow-lg">
                CoreWerx Solutions! <br /> Ask anything.
            </h1>

            {/* Chat Container */}
            <div className="w-full max-w-lg mt-5 p-4 bg-black bg-opacity-60 rounded-lg shadow-lg">
                <div className="h-64 overflow-y-auto p-3 space-y-2">
                    {messages.map((msg, index) => (
                        <p key={index} className={`text-${msg.role === "user" ? "blue" : "green"}-400`}>
                            <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.text}
                        </p>
                    ))}
                </div>

                {/* Chat Input Box */}
                <div className="flex mt-3">
                    <input 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 p-3 rounded-l-lg border border-gray-600 bg-white text-black text-left placeholder-gray-400"
                    />
                    <button 
                        onClick={handleSendMessage} 
                        className="bg-blue-600 text-white px-4 rounded-r-lg"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
