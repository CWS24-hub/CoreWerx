"use client";

import { useState } from "react";

export default function ChatBox() {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]); // Store chat history
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!query.trim()) return; // Prevent empty messages

        setLoading(true);

        // Store user message
        const newMessages = [...messages, { role: "user", content: query }];
        setMessages(newMessages);
        setQuery(""); // Clear input

        try {
            // Send request to OpenAI API
            const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: query }), // ✅ Correct
});

            const data = await response.json();
            
            if (data.error) {
                setMessages([...newMessages, { role: "system", content: "Error: " + data.error }]);
            } else {
                setMessages([...newMessages, { role: "assistant", content: data.reply }]);
            }
        } catch (error) {
            setMessages([...newMessages, { role: "system", content: "Failed to fetch response." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="flex flex-col h-screen items-center justify-start bg-cover bg-center text-white text-center p-6"
            style={{ 
                backgroundImage: "url('/main_cover.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >
            {/* Slogan Section */}
            <h1 className="text-5xl font-extrabold mt-20 max-w-3xl leading-tight tracking-wide text-white drop-shadow-lg">
                CoreWerx Solutions! <br /> Ask anything.
            </h1>

            {/* Chat Messages */}
            <div className="w-full max-w-lg mt-5 p-4 bg-gray-900 bg-opacity-80 rounded-lg shadow-md text-left h-64 overflow-y-auto">
                {messages.map((msg, index) => (
                    <p key={index} className={msg.role === "user" ? "text-blue-400" : "text-green-400"}>
                        <strong>{msg.role === "user" ? "You: " : "Bot: "}</strong> {msg.content}
                    </p>
                ))}
            </div>

            {/* Chat Input Box */}
            <div className="flex w-full max-w-lg mt-4">
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Office 365, Cloud Services, Cybersecurity, Managed IT Service"
                    className="flex-grow p-3 rounded-l-lg border border-gray-600 bg-white text-black text-left placeholder-gray-500 shadow-md"
                />
                <button 
                    onClick={handleSendMessage} 
                    className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? "..." : "Send"}
                </button>
            </div>
        </div>
    );
}
