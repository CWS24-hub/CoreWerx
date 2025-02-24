export async function POST(req) {
  try {
    const { message, step = "initial", email = "", slot = "", context = {} } = await req.json();

    if (!message && step === "initial") {
      return Response.json({ error: "No message provided." }, { status: 400 });
    }

    const response = getChatbotResponse(message, step, email, slot, context);
    return Response.json({ 
      reply: response.reply, 
      nextStep: response.nextStep,
      email: response.email || email,
      slot: response.slot || slot,
      context: response.context || context,
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
  "Email Security": "Safeguard your business emails with our AI-powered solutions, especially optimized for Microsoft Office 365!",
};

// Enhanced NLU with intent detection
function matchIntent(message) {
  const lowerMessage = message.toLowerCase();
  const intents = {
    email_setup: ["emails", "professional emails", "business emails", "create emails", "setup emails"],
    email_improvement: ["email security", "secure email", "improve emails", "email protection"],
    email_migration: ["email migration", "migrate emails", "move emails"],
    office_365: ["office 365", "microsoft 365", "o365"],
    general_it: ["managed it", "cloud solutions", "cybersecurity"],
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return intent;
    }
  }
  return null;
}

function getChatbotResponse(message, step, email, slot, context) {
  switch (step) {
    case "initial":
      if (!message.trim()) {
        return {
          reply: "Hi there! I’m your CoreWerx Solutions assistant. 😊 What IT services can I help with today? Try ‘Emails,’ ‘Email Security,’ or ‘Cloud Solutions’!",
          nextStep: "initial",
          context: {},
        };
      }
      const intent = matchIntent(message);
      if (intent) {
        switch (intent) {
          case "email_setup":
            return {
              reply: "Awesome! Are you looking to set up new email systems in the cloud, or do you already have emails and want to improve the system?",
              nextStep: "email_setup",
              context: { intent: "email_setup" },
            };
          case "email_improvement":
            return {
              reply: "Great question! To recommend the best solution, do you already have email systems in the cloud (e.g., Office 365, Google Workspace) that need security or improvements?",
              nextStep: "email_improvement",
              context: { intent: "email_improvement" },
            };
          case "email_migration":
            return {
              reply: "I’d love to help with email migration! Are you migrating from a traditional email system or a professional service like Google Workspace or Office 365? And to which platform?",
              nextStep: "email_migration",
              context: { intent: "email_migration" },
            };
          case "office_365":
            return {
              reply: "Fantastic choice! Microsoft Office 365 offers top-notch email, cloud, and productivity tools. Would you like to book a consultation to explore licenses and setup? Just share your email! 😊",
              nextStep: "contact",
              context: { intent: "office_365" },
            };
          case "general_it":
            const matchedServices = matchService(message);
            const topMatch = Object.entries(matchedServices).find(([s]) => 
              message.toLowerCase().includes(s.toLowerCase()));
            if (topMatch) {
              const [service, desc] = topMatch;
              return {
                reply: `Awesome choice! For **${service}**: ${desc}\n\nReady to **book a consultation** and secure your IT needs? Just share your email, and I’ll walk you through! 😊`,
                nextStep: "contact",
                context: { intent: "general_it", service },
              };
            }
            return {
              reply: `Great question! Based on that, I think you might mean **Cloud Solutions** or **Cybersecurity**. Which service are you interested in? Or, let’s **book a consultation** — share your email!`,
              nextStep: "initial",
              context: {},
            };
        }
      }
      return {
        reply: `Hmm, I’m not sure I caught that. 😅 Did you mean something like **Emails**, **Email Security**, or **Cloud Solutions**? Or, let’s **kickstart your IT journey** with a free consultation — share your email!`,
        nextStep: "initial",
        context: {},
      };

    case "email_setup":
      if (!context.type) {
        const type = message.toLowerCase();
        if (type.includes("new") || type.includes("setup") || type.includes("don’t have")) {
          return {
            reply: "Fantastic! There are a few big players for professional emails, like Microsoft Office 365 and Google Workspace. I highly recommend Microsoft Office 365 — it offers superior integration with Microsoft 365 tools, stronger security, and better productivity features compared to Google. Would you like to explore Office 365 for your new email setup? Or, tell me if you prefer another option!",
            nextStep: "email_setup",
            context: { ...context, type: "new" },
          };
        } else if (type.includes("already") || type.includes("improve")) {
          return {
            reply: "Got it — you already have emails! Do you need to improve security (e.g., Email Security), migrate to a new platform, or enhance your system? Let me know!",
            nextStep: "email_improvement",
            context: { ...context, type: "existing" },
          };
        }
        return {
          reply: "Thanks! Are you setting up new email systems in the cloud, or do you already have emails you want to improve? Let me know, and I’ll guide you! 😊",
          nextStep: "email_setup",
          context,
        };
      }
      if (context.type === "new") {
        const platform = message.toLowerCase();
        if (platform.includes("office") || platform.includes("365")) {
          return {
            reply: "Excellent choice — Microsoft Office 365 is ideal for professional emails! We’ll set up robust email services for your business. Ready to **book a consultation**? Share your email, and I’ll guide you! 😊",
            nextStep: "contact",
            context: { ...context, platform: "Office 365" },
          };
        } else if (platform.includes("google") || platform.includes("workspace")) {
          return {
            reply: "Great, Google Workspace is an option! However, I strongly recommend Microsoft Office 365 for its superior integration, security, and productivity tools. Would you like to explore Office 365 instead? Or, book a consultation — share your email!",
            nextStep: "contact",
            context: { ...context, platform: "Google Workspace" },
          };
        }
        return {
          reply: "Thanks! Are you thinking of Microsoft Office 365, Google Workspace, or another platform for your new emails? I recommend Office 365 for its power — let me know! 😊",
          nextStep: "email_setup",
          context,
        };
      }
      return {
        reply: `Based on your preference for ${context.platform}, I recommend **Professional Emails** with ${context.platform}. Ready to **book a consultation**? Share your email, and I’ll assist! 😊`,
        nextStep: "contact",
        context,
      };

    case "email_improvement":
      if (!context.platform) {
        const platform = message.toLowerCase();
        if (platform.includes("office") || platform.includes("365")) {
          return {
            reply: `Perfect — you’re using Microsoft Office 365! For **Email Security**: Safeguard your emails with our AI-powered solutions, optimized for Office 365. Ready to **book a consultation**? Share your email, and I’ll guide you! 😊`,
            nextStep: "contact",
            context: { ...context, platform: "Office 365" },
          };
        } else if (platform.includes("google") || platform.includes("workspace")) {
          return {
            reply: `Got it, Google Workspace! We can secure your emails with our solutions, though I recommend migrating to Microsoft Office 365 for enhanced features. Would you like to explore that? Or, book a consultation — share your email!`,
            nextStep: "contact",
            context: { ...context, platform: "Google Workspace" },
          };
        }
        return {
          reply: `Thanks! What cloud email service are you using? (e.g., Microsoft Office 365, Google Workspace) I’ll recommend the best improvements, like **Email Security** or migration!`,
          nextStep: "email_improvement",
          context,
        };
      }
      if (!context.improvement) {
        const improvement = message.toLowerCase();
        if (improvement.includes("security")) {
          return {
            reply: `Got it — you want **Email Security** for ${context.platform}! We’ll protect your emails with AI-powered solutions. Ready to **book a consultation**? Share your email, and I’ll assist! 😊`,
            nextStep: "contact",
            context: { ...context, improvement: "security" },
          };
        } else if (improvement.includes("migrate")) {
          return {
            reply: "Perfect — let’s handle email migration! Where would you like to migrate to? I recommend Microsoft Office 365 for its robust features — would that work? (e.g., Office 365, Google Workspace)",
            nextStep: "email_migration",
            context: { ...context, improvement: "migration" },
          };
        }
        return {
          reply: `Thanks! Do you need **Email Security**, email migration, or another improvement for ${context.platform}? Let me know, and I’ll guide you! 😊`,
          nextStep: "email_improvement",
          context,
        };
      }
      return {
        reply: `Based on your ${context.improvement} needs for ${context.platform}, I recommend our **${context.improvement === "security" ? "Email Security" : "Email Migration"}** service. Ready to **book a consultation**? Share your email, and I’ll assist! 😊`,
        nextStep: "contact",
        context,
      };

    case "email_migration":
      if (!context.fromPlatform) {
        const fromPlatform = message.toLowerCase();
        if (fromPlatform.includes("traditional")) {
          return {
            reply: `Got it — migrating from a traditional email system! Where would you like to migrate to? I recommend Microsoft Office 365 for its robust features — would that work? (e.g., Office 365, Google Workspace)`,
            nextStep: "email_migration",
            context: { ...context, fromPlatform: "traditional" },
          };
        } else if (fromPlatform.includes("google") || fromPlatform.includes("workspace")) {
          return {
            reply: `Perfect — migrating from Google Workspace! Where to? I recommend Microsoft Office 365 for enhanced features — would that suit you? (e.g., Office 365, another platform)`,
            nextStep: "email_migration",
            context: { ...context, fromPlatform: "Google Workspace" },
          };
        } else if (fromPlatform.includes("office") || fromPlatform.includes("365")) {
          return {
            reply: `Got it — migrating from Microsoft Office 365! Where to? Or, let’s optimize your setup with Office 365 enhancements. Ready to **book a consultation**? Share your email! 😊`,
            nextStep: "contact",
            context: { ...context, fromPlatform: "Office 365" },
          };
        }
        return {
          reply: `Thanks! Are you migrating from a traditional email system, Google Workspace, Microsoft Office 365, or another service? Let me know, and I’ll recommend the best path!`,
          nextStep: "email_migration",
          context,
        };
      }
      if (!context.toPlatform) {
        const toPlatform = message.toLowerCase();
        if (toPlatform.includes("office") || toPlatform.includes("365")) {
          return {
            reply: `Excellent — migrating to Microsoft Office 365! We’ll handle the move from ${context.fromPlatform} smoothly. Ready to **book a consultation**? Share your email, and I’ll guide you! 😊`,
            nextStep: "contact",
            context: { ...context, toPlatform: "Office 365" },
          };
        } else if (toPlatform.includes("google") || toPlatform.includes("workspace")) {
          return {
            reply: `Got it — migrating to Google Workspace from ${context.fromPlatform}! We can assist, but I recommend Microsoft Office 365 for better features. Would you like to explore that? Or, book a consultation — share your email!`,
            nextStep: "contact",
            context: { ...context, toPlatform: "Google Workspace" },
          };
        }
        return {
          reply: `Thanks! Where would you like to migrate to? I recommend Microsoft Office 365 for its robust features — does that work? (e.g., Office 365, Google Workspace)`,
          nextStep: "email_migration",
          context,
        };
      }
      return {
        reply: `You’re set to migrate from ${context.fromPlatform} to ${context.toPlatform}! I recommend enhancing with Microsoft Office 365 features. Ready to **book a consultation**? Share your email, and I’ll assist! 😊`,
        nextStep: "contact",
        context,
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
            reply: `Awesome! You’re booked for tomorrow at 10:00 AM UAE time. Expect a confirmation email at ${email} — we’re excited to tailor your IT solution! Anything else, or ready to explore more? 😊`,
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
        reply: `Looks like we hit a snag. 😅 Let’s start fresh! What IT services can I assist with today? Try ‘Emails’ or ‘Cloud Solutions’ — or book a consultation with your email!`,
        nextStep: "initial",
        context: {},
      };
  }
}

// Helper function to match services (unchanged but included for completeness)
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