const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const categorizeText = async (text) => {
  if (!text || typeof text !== "string") {
    return { category: "Other", aiConfidence: 0, aiCategorized: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${AI_SERVICE_URL}/categorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { category: "Other", aiConfidence: 0, aiCategorized: false };
    }

    const data = await response.json();
    return {
      category: data.category || "Other",
      aiConfidence: typeof data.confidence === "number" ? data.confidence : 0,
      aiCategorized: true,
    };
  } catch (error) {
    // Graceful fallback if AI service is down or slow
    return { category: "Other", aiConfidence: 0, aiCategorized: false };
  }
};

module.exports = { categorizeText };
