import { GoogleGenAI, Type } from "@google/genai";
import { ResearchResult, ChartType, AudienceType, GroundingSource, GeneratedImage } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY' });

/**
 * Step 1: Research the topic using Google Search Grounding.
 */
export const performResearch = async (topic: string, audience: AudienceType): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    const modelId = "gemini-3-flash-preview"; 
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Conduct thorough research on the topic: "${topic}". 
      Focus on finding recent, verifiable statistics, data trends, and key facts that would appeal to a ${audience} audience.
      Provide a comprehensive summary of the findings including specific numbers and dates where available.`,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for speed on flash model
      },
    });

    // Extract grounding metadata
    const candidates = response.candidates;
    const groundingChunks = candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = groundingChunks
      .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((s: any) => s !== null)
      // Deduplicate sources by URI
      .filter((v: any, i: any, a: any) => a.findIndex((t: any) => (t.uri === v.uri)) === i);

    return {
      text: response.text || "No research data found.",
      sources,
    };

  } catch (error: any) {
    console.error("Research Error:", error);
    throw new Error(`Research failed: ${error.message}`);
  }
};

/**
 * Step 2: Structure the research into JSON for UI rendering.
 */
export const structureResearchData = async (researchText: string, audience: AudienceType): Promise<ResearchResult> => {
  try {
    const modelId = "gemini-3-flash-preview";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Analyze the following research text and extract structured data for a visual presentation tailored to ${audience}.
      
      Research Text:
      """
      ${researchText}
      """

      Requirements:
      1. Create a "summary" of the research (max 100 words).
      2. Identify the best chart type (bar, pie, area, line) to represent the key statistics found. If no stats are found, use 'none'.
      3. specific "chartData" with 'name' and 'value' fields for the chart.
      4. A "chartTitle", "chartXAxis" label, and "chartYAxis" label.
      5. A creative "imagePrompt" to generate a high-quality, modern, abstract or illustrative header image representing this topic.

      Output JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            chartType: { type: Type.STRING, enum: [ChartType.BAR, ChartType.PIE, ChartType.AREA, ChartType.LINE, ChartType.NONE] },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                },
                required: ["name", "value"]
              }
            },
            chartTitle: { type: Type.STRING },
            chartXAxis: { type: Type.STRING },
            chartYAxis: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
          },
          required: ["summary", "chartType", "chartData", "chartTitle", "imagePrompt"]
        }
      }
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);

    return {
      summary: data.summary,
      chartType: data.chartType,
      chartData: data.chartData,
      chartTitle: data.chartTitle,
      chartXAxis: data.chartXAxis,
      chartYAxis: data.chartYAxis,
      imagePrompt: data.imagePrompt,
      groundingSources: [], // To be merged from step 1
    };

  } catch (error: any) {
    console.error("Structuring Error:", error);
    throw new Error(`Data structuring failed: ${error.message}`);
  }
};

/**
 * Step 3: Generate an image based on the prompt.
 */
export const generateVisual = async (prompt: string): Promise<GeneratedImage> => {
  try {
    // Using gemini-2.5-flash-image for generation as per instructions
    const modelId = "gemini-2.5-flash-image"; 
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    let imageUrl = "";
    let mimeType = "";

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          mimeType = part.inlineData.mimeType;
          break; 
        }
      }
    }

    if (!imageUrl) {
        throw new Error("No image data returned from model.");
    }

    return { url: imageUrl, mimeType };

  } catch (error: any) {
    console.error("Image Gen Error:", error);
    // Return a placeholder or null logic could be handled in UI, but we throw here to let UI know
    throw new Error(`Image generation failed: ${error.message}`);
  }
};
