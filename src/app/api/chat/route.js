export async function POST(req) {
  try {
    const { message, step = "initial", email = "", slot = "" } = await req.json();

    if (!message && step === "initial") {
      return Response.json({ error: "No message provided." }, { status: 400 });
    }

    const response = getChatbotResponse(message, step, email, slot);
    return Response.json({ 
      reply: response.reply, 
      nextStep: response.nextStep,
      email: response.email || email,
      slot: response.slot || slot,
    });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed to process request." }, { status: 500 });
  }
}

const services = {
  "Managed IT Services": "Full-service IT management, support, and security to keep your business running smoothly.",
  "Cloud Solutions": "Expert Azure and Office 365 solutions, including migration, management, and security for your cloud needs.",
  "CRM Implementation": "Custom Salesforce setup to boost your customer management and sales efficiency.",
  "Microsoft Modern Workplace": "Enhance productivity with Microsoft tools like Teams, SharePoint, and OneDrive.",
  "Cybersecurity & Compliance": "Protect your business with advanced security, audits, and compliance management.",
  "Email Security": "Safeguard your business emails with our AI-powered security solutions — a smart choice!",
};

// Enhanced NLU function to handle synonyms and varied phrasing
function matchService(message) {
  const lowerMessage = message.toLowerCase();
  const serviceMatches = {};

  for (const service in services) {
    const keywords = service.toLowerCase().split(" ");
    const synonyms = {
      "managed": ["managed", "maintenance", "support"],
      "it": ["it", "technology", "tech"],
      "cloud": ["cloud", "azure", "office 365"],
      "crm": ["crm", "salesforce", "customer"],
      "microsoft": ["microsoft", "teams", "sharepoint", "onedrive"],
      "cybersecurity": ["cybersecurity", "security", "protection"],
      "email": ["email", "mail", "inbox"],
    };

    if (keywords.some(keyword => lowerMessage.includes(keyword)) || 
        Object.values(synonyms).some(syn => syn.some(s => lowerMessage.includes(s)))) {
      serviceMatches[service] = services[service];
    }
  }

  return serviceMatches;
}

function getChatbotResponse(message, step, email, slot) {
  switch (step) {
    case "initial":
      if (!message.trim()) {
        return {
          reply: "Hi there! I’m your CoreWerx Solutions assistant. 😊 What IT services can I help with today? Try asking about Managed IT, Cloud Solutions, or Cybersecurity!",
          nextStep: "initial",
        };
      }
      const matchedServices = matchService(message);
      if (Object.keys(matchedServices).length > 0) {
        const serviceList = Object.entries(matchedServices)
          .map(([service, desc]) => `🔹 **${service}**: ${desc}`)
          .join("\n");
        return {
          reply: `Great question! Here’s what I found:\n${serviceList}\n\nWould you like to **book a consultation** or **schedule a callback**? Just share your email, and I’ll guide you further!`,
          nextStep: "contact",
        };
      }
      return {
        reply: `Hmm, I’m not sure about that. 😅 How about asking about our IT services like **Managed IT**, **Cloud Solutions**, or **Cybersecurity**? Or, would you like to **book a free consultation**? Share your email, and I’ll assist!`,
        nextStep: "contact",
      };

    case "contact":
      if (!email) {
        return {
          reply: `Awesome, thanks for reaching out! What’s your email address? I’ll use it to schedule your consultation or callback. 😊`,
          nextStep: "contact",
        };
      }
      return {
        reply: `Perfect, I’ve got your email: ${email}. Now, let’s pick a meeting slot. Here are your options:\n1. Tomorrow at 10:00 AM UAE time\n2. Tomorrow at 2:00 PM UAE time\nJust reply with 1 or 2!`,
        nextStep: "slots",
      };

    case "slots":
      if (!slot) {
        const slotNum = parseInt(message);
        if (slotNum === 1) {
          return {
            reply: `Great choice! I’ve booked you for tomorrow at 10:00 AM UAE time. We’ll send a confirmation to ${email}. Anything else I can help with? 😊`,
            nextStep: "initial",
            slot: "10:00 AM",
          };
        } else if (slotNum === 2) {
          return {
            reply: `Excellent! You’re booked for tomorrow at 2:00 PM UAE time. Expect a confirmation email at ${email}. Need anything else? 😊`,
            nextStep: "initial",
            slot: "2:00 PM",
          };
        }
        return {
          reply: `Oops, I didn’t catch that. Please pick 1 for 10:00 AM or 2 for 2:00 PM UAE time. 😊`,
          nextStep: "slots",
        };
      }
      return {
        reply: `You’re all set for tomorrow at ${slot} UAE time! We’ll follow up via ${email}. How else can I assist today? 😊`,
        nextStep: "initial",
      };

    default:
      return {
        reply: `Looks like we hit a snag. 😅 Let’s start fresh! What IT services can I help with today?`,
        nextStep: "initial",
      };
  }
}