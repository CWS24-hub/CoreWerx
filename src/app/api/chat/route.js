// File: /app/api/chat/route.js

export async function POST(req) {
    try {
        const { message } = await req.json();
        const response = getChatbotResponse(message);
        return Response.json({ reply: response });
    } catch (error) {
        return Response.json({ error: "Failed to process request." }, { status: 500 });
    }
}

// List of services and their descriptions
const services = {
    "Managed IT Services": "We offer full-service IT management, including support, security, and infrastructure maintenance.",
    "Cloud Solutions": "We provide Azure and Office 365 solutions, including migration, management, and security.",
    "CRM Implementation": "We help businesses implement and customize salesforce for better customer management.",
    "Microsoft Modern Workplace": "Enhance productivity with Microsoft tools like Teams, SharePoint, and OneDrive.",
    "Cybersecurity & Compliance": "Protect your business with advanced security solutions, audits, and compliance management."
	"Email security & Compliance": "Protect your business Emails with advanced AI capable security solutions."
};

// Function to check user message and match services
function getChatbotResponse(userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    for (const service in services) {
        if (lowerCaseMessage.includes(service.toLowerCase())) {
            return `🔹 ${service}: ${services[service]} \n👉 Would you like to book a consultation?`;
        }
    }
    
    return "I'm here to help! Please ask about our IT services, such as Managed IT, Cloud Solutions, or Cybersecurity.";
}
