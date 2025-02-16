export async function POST(req) {
    try {
        const body = await req.json(); // Ensure request body is read properly
        const message = body.message; // Extract message correctly

        console.log("User message:", message); // Debugging log

        if (!message) {
            return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
        }

        // Call OpenAI API
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
        console.log("OpenAI Response:", data); // Log API response

        if (!data.choices || data.choices.length === 0) {
            return new Response(JSON.stringify({ reply: "No valid response from AI" }), { status: 500 });
        }

        return new Response(JSON.stringify({ reply: data.choices[0]?.message?.content || "No response from AI" }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error calling OpenAI:", error);
        return new Response(JSON.stringify({ error: "Failed to process request" }), { status: 500 });
    }
}
