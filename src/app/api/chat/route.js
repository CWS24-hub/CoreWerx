// File: /app/api/chat/route.js

export async function POST(req) {
    try {
        const { message } = await req.json();
        console.log("Received message:", message);

        if (!message) {
            return Response.json({ error: "Invalid request: No message provided." }, { status: 400 });
        }

        const response = getChatbotResponse(message);
        return Response.json({ reply: response });
    } catch (error) {
        console.error("Error processing request:", error);
        return Response.json({ error: "Failed to process request." }, { status: 500 });
    }
}

// List of services and their descriptions
const services = {
    "Managed IT Services": "We offer full-service IT management, including support, security, and infrastructure maintenance.",
    "Cloud Solutions": "We provide Azure and Office 365 solutions, including migration, management, and security.",
    "CRM Implementation": "We help businesses implement and customize Salesforce for better customer management.",
    "Microsoft Modern Workplace": "Enhance productivity with Microsoft tools like Teams, SharePoint, and OneDrive.",
    "Cybersecurity & Compliance": "Protect your business with advanced security solutions, audits, and compliance management.",
    "Email Security & Compliance": "Protect your business emails with advanced AI-capable security solutions."
};

// Function to check user message and match services
function getChatbotResponse(userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();
    let matchedServices = [];

    for (const service in services) {
        if (lowerCaseMessage.includes(service.toLowerCase()) || lowerCaseMessage.includes(service.split(" ")[0].toLowerCase())) {
            matchedServices.push(`🔹 ${service}: ${services[service]}`);
        }
    }

    if (matchedServices.length > 0) {
        return `${matchedServices.join("\n")}\n👉 Would you like to **book a consultation** or a **callback**? Click here to schedule: [Book a Meeting](#)`;
    }

    return "I'm here to help! Please ask about our IT services, such as **Managed IT**, **Cloud Solutions**, or **Cybersecurity**.\n\nWould you like to book a **free consultation**? [Click here](#) to schedule.";
}
