import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { message } = await req.json();
        console.log("User message received:", message);

        if (!message) {
            return NextResponse.json({ error: "Empty message" }, { status: 400 });
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
            }),
        });

        const data = await response.json();
        console.log("OpenAI API Response:", data);

        if (!data.choices || data.choices.length === 0) {
            return NextResponse.json({ reply: "No valid response from AI" });
        }

        return NextResponse.json({ reply: data.choices[0]?.message?.content || "No response from AI" });
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
