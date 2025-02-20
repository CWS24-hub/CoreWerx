export async function POST(req) {
  try {
    const { message, step = "initial" } = await req.json();

    if (!message && step === "initial") {
      return Response.json({ error: "No message provided." }, { status: 400 });
    }

    const response = getChatbotResponse(message, step);
    return Response.json({ reply: response.reply, nextStep: response.nextStep });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed to process request." }, { status: 500 });
  }
}

const services = {
  "Managed IT Services": "Full-service IT management, support, and security.",
  "Cloud Solutions": "Azure and Office 365 migration and management.",
  "CRM Implementation": "Salesforce setup and customization.",
  "Microsoft Modern Workplace": "Boost productivity with Teams and SharePoint.",
  "Cybersecurity & Compliance": "Advanced security and audits.",
  "Email Security": "AI-powered email protection.",
};

function getChatbotResponse(message, step) {
  if (step === "initial") {
    const lowerCaseMessage = message.toLowerCase();
    let matchedServices = [];
    for (const service in services) {
      if (
        lowerCaseMessage.includes(service.toLowerCase()) ||
        lowerCaseMessage.includes(service.split(" ")[0].toLowerCase())
      ) {
        matchedServices.push(`🔹 ${service}: ${services[service]}`);
      }
    }
    if (matchedServices.length > 0) {
      return {
        reply: `${matchedServices.join("\n")}\n👉 Want to **book a consultation** or **callback**? Please provide your email.`,
        nextStep: "contact",
      };
    }
    return {
      reply: "Ask me about our IT services like **Managed IT**, **Cloud Solutions**, or **Cybersecurity**.\n\nBook a **free consultation**: Provide your email!",
      nextStep: "contact",
    };
  }

  if (step === "contact") {
    return {
      reply: `Thanks! Now, pick a meeting slot:\n1. Tomorrow 10 AM\n2. Tomorrow 2 PM\nReply with a number.`,
      nextStep: "slots",
    };
  }

  if (step === "slots") {
    const slot = parseInt(message);
    if (slot === 1 || slot === 2) {
      return {
        reply: `Booked slot ${slot === 1 ? "Tomorrow 10 AM" : "Tomorrow 2 PM"}! We’ll follow up via email.\nAnything else?`,
        nextStep: "initial",
      };
    }
    return { reply: "Invalid slot. Try 1 or 2.", nextStep: "slots" };
  }

  return { reply: "Something went wrong. Let’s start over.", nextStep: "initial" };
}