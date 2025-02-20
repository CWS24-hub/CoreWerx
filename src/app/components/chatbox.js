"use client";
import { useState, useEffect } from "react";

export default function ChatBox() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi there! I’m your CoreWerx Solutions assistant. 😊 What IT services can I help with today? Try asking about Managed IT, Cloud Solutions, or Cybersecurity!" },
  ]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("initial");
  const [email, setEmail] = useState("");
  const [slot, setSlot] = useState("");

  useEffect(() => {
    console.log("Updated Messages:", messages);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!query.trim() && step !== "contact" && step !== "slots") return;
    setLoading(true);

    const userMessage = step === "contact" ? email : step === "slots" ? query : query;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setQuery("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, step, email, slot }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setStep(data.nextStep || "initial");
      setEmail(data.email || email);
      setSlot(data.slot || slot);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "system", content: "Oops, something went wrong. Let’s try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = () => {
    if (step === "contact") {
      return (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
          className="flex-grow p-3 rounded-l-lg border border-gray-600 bg-white text-black placeholder-gray-500 shadow-md"
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
      );
    }
    if (step === "slots") {
      return (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter 1 or 2 for the slot..."
          className="flex-grow p-3 rounded-l-lg border border-gray-600 bg-white text-black placeholder-gray-500 shadow-md"
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
      );
    }
    return (
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about IT services..."
        className="flex-grow p-3 rounded-l-lg border border-gray-600 bg-white text-black placeholder-gray-500 shadow-md"
        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
      />
    );
  };

  return (
    <div
      className="flex flex-col h-screen items-center justify-start bg-cover bg-center text-white text-center p-6"
      style={{ backgroundImage: "url('/Main_Cover.jpg')" }}
    >
      <h1 className="text-5xl font-extrabold mt-20 max-w-3xl leading-tight tracking-wide text-white drop-shadow-lg">
        CoreWerx Solutions! <br /> Ask Away.
      </h1>
      <div className="w-full max-w-lg mt-5 p-4 bg-gray-900 bg-opacity-80 rounded-lg shadow-md text-left h-64 overflow-y-auto border border-white">
        {messages.map((msg, index) => (
          <p key={index} className={msg.role === "user" ? "text-blue-400" : "text-green-400"}>
            <strong>{msg.role === "user" ? "You: " : "Bot: "}</strong> {msg.content}
          </p>
        ))}
      </div>
      <div className="flex w-full max-w-lg mt-4">
        {renderInput()}
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