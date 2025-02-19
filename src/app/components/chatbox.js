"use client";

import { useState, useEffect } from "react";

export default function ChatBox() {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Debugging: Log messages when they update
    useEffect(() => {
        console.log("Updated Messages:", messages);
    }, [messages]);

    const handleSendMessage = async () => {
        if (!query.trim()) return;

        setLoading(true);

        setMessages((prevMessages) => [
            ...prevMessages,
            { role: "user", content: query }
        ]);

        setQuery("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: query }),
            });

            const data = await response.json();

            if (data.error) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { role: "system", content: "Error: " + data.error }
                ]);
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { role: "assistant", content: data.reply }
                ]);
            }
        } catch (error) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: "system", content: "Failed to fetch response." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen items-center justify-start bg-cover bg-center text-white text-center p-6"
            style={{ 
                backgroundImage: "url('/Main_Cover.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >
            <h1 className="text-5xl font-extrabold mt-20 max-w-3xl leading-tight tracking-wide text-white drop-shadow-lg">
                CoreWerx Solutions! <br /> Ask Away.
            </h1>

            <div className="w-full max-w-lg mt-5 p-4 bg-gray-900 bg-opacity-80 rounded-lg shadow-md text-left h-64 overflow-y-auto border border-white">
                {messages.length === 0 ? (
                    <p className="text-green-400">Loading messages...</p>
                ) : (
                    messages.map((msg, index) => (
                        <p key={index} className={msg.role === "user" ? "text-blue-400" : "text-green-400"}>
                            <strong>{msg.role === "user" ? "You: " : "Bot: "}</strong> {msg.content}
                        </p>
                    ))
                )}
            </div>

            <div className="flex w-full max-w-lg mt-4">
                <input 
                    type="