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
  "Email Security": "Safeguard your business emails with our AI-powered security solutions — the perfect choice to secure your inbox!",
};

// Enhanced NLU with intent clarification
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
          reply: "Hi there! I’m your CoreWerx Solutions assistant. 😊 What IT services can I help with today? Try ‘Email Security,’ ‘Cloud Solutions,’ or ‘Managed IT’!",
          nextStep: "initial",
        };
      }
      const matchedServices = matchService(message);
      if (Object.keys(matchedServices).length > 0) {
        const topMatch = Object.entries(matchedServices)
          .find(([service]) => message.toLowerCase().includes(service.toLowerCase()) || 
                              message.toLowerCase().includes(service.split(" ")[0].toLowerCase()));
        if (topMatch) {
          const [service, desc] = topMatch;
          return {
            reply: `Awesome choice! For **${service}**: ${desc}\n\nReady to **book a consultation** and secure your IT needs? Just share your email, and I’ll walk you through scheduling! 😊`,
            nextStep: "contact",
          };
        }
        // If multiple or vague matches, suggest top options
        const topServices = Object.entries(matchedServices).slice(0, 2).map(([s, d]) => `🔹 **${s}**: ${d}`).join("\n");
        return {
          reply: `Great question! Based on that, I think you might mean:\n${topServices}\n\nWhich service are you interested in? Or, let’s **book a consultation** — just provide your email!`,
          nextStep: "initial",
        };
      }
      return {
        reply: `Hmm, I’m not sure I caught that. 😅 Did you mean something like **Email Security**, **Cloud Solutions**, or **Cybersecurity**? Or, let’s **kickstart your IT journey** with a free consultation — share your email, and I’ll guide you!`,
        nextStep: "initial",
      };

    case "contact":
      if (!email) {
        return {
          reply: `Fantastic! What’s your email address? I’ll use it to schedule your personalized consultation and keep you updated. 😊`,
          nextStep: "contact",
        };
      }
      return {
        reply: `Perfect, I’ve saved your email: ${email}. Let’s pick a time for your consultation. Here’s what’s available:\n1. Tomorrow at 10:00 AM UAE time\n2. Tomorrow at 2:00 PM UAE time\nJust reply with 1 or 2, and we’ll lock it in!`,
        nextStep: "slots",
      };

    case "slots":
      if (!slot) {
        const slotNum = parseInt(message);
        if (slotNum === 1) {
          return {
            reply: `Awesome! You’re booked for tomorrow at 10:00 AM UAE time. Expect a confirmation email at ${email} — we’re excited to help with your IT needs! Anything else on your mind, or ready to explore more solutions? 😊`,
            nextStep: "initial",
            slot: "10:00 AM",
          };
        } else if (slotNum === 2) {
          return {
            reply: `Excellent! Your consultation is set for tomorrow at 2:00 PM UAE time. We’ll send details to ${email}. Want to dive deeper into our IT services or book another slot? Let me know! 😊`,
            nextStep: "initial",
            slot: "2:00 PM",
          };
        }
        return {
          reply: `Oops, I didn’t catch that. Please pick 1 for 10:00 AM or 2 for 2:00 PM UAE time. I’m here to make it easy for you! 😊`,
          nextStep: "slots",
        };
      }
      return {
        reply: `You’re all set for tomorrow at ${slot} UAE time! We’ll follow up via ${email}. Ready to explore more IT solutions or book another consultation? Just ask! 😊`,
        nextStep: "initial",
      };

    default:
      return {
        reply: `Looks like we hit a snag. 😅 Let’s start fresh! What IT services can I assist with today? Try ‘Email Security’ or ‘Cloud Solutions’ — or book a consultation with your email!`,
        nextStep: "initial",
      };
  }
}