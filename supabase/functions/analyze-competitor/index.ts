import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { competitor, userIdea, analysisType = "full" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing competitor:", competitor);

    const systemPrompt = `You are a strategic business analyst specializing in competitive analysis. Provide comprehensive, actionable market intelligence.

Your analysis should be:
- Data-driven and specific (use percentages, market sizes when relevant)
- Actionable with clear strategic recommendations
- Balanced, showing both opportunities and threats
- Structured for easy understanding`;

    const userPrompt = `Perform a FULL MARKET ANALYSIS comparing this user's idea/product against a competitor.

USER'S IDEA/PRODUCT:
"${userIdea}"

COMPETITOR TO ANALYZE:
"${competitor}"

Provide your analysis in this exact JSON format:
{
  "competitorOverview": {
    "name": "Competitor name",
    "description": "Brief description of what they do",
    "marketPosition": "Their position in the market",
    "estimatedSize": "Company size/scale estimate",
    "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"]
  },
  "swotAnalysis": {
    "strengths": ["Your idea's strength vs this competitor 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
    "opportunities": ["Market opportunity 1", "Opportunity 2", "Opportunity 3"],
    "threats": ["Threat from competitor 1", "Threat 2", "Threat 3"]
  },
  "marketAnalysis": {
    "marketSize": "Estimated total addressable market",
    "growthRate": "Market growth trajectory",
    "trends": ["Key trend 1", "Trend 2", "Trend 3"],
    "targetSegments": ["Segment you should target 1", "Segment 2"]
  },
  "competitiveAdvantages": {
    "yourAdvantages": ["Where you can win 1", "Advantage 2", "Advantage 3"],
    "theirAdvantages": ["Where they're strong 1", "Advantage 2"],
    "differentiationOpportunities": ["How to differentiate 1", "Opportunity 2", "Opportunity 3"]
  },
  "strategicRecommendations": {
    "immediate": ["Do this now 1", "Action 2"],
    "shortTerm": ["Next 3-6 months action 1", "Action 2"],
    "longTerm": ["Strategic positioning 1", "Long-term play 2"]
  },
  "riskAssessment": {
    "competitiveRisks": ["Risk 1", "Risk 2"],
    "marketRisks": ["Risk 1", "Risk 2"],
    "mitigationStrategies": ["How to mitigate 1", "Strategy 2"]
  },
  "overallScore": {
    "competitiveViability": 75,
    "marketOpportunity": 80,
    "executionDifficulty": 60,
    "summary": "Brief overall assessment"
  }
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Competitor analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    console.log("AI response:", content);

    // Strip markdown code blocks if present
    if (content.startsWith("```json")) {
      content = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (content.startsWith("```")) {
      content = content.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let analysis;
    try {
      analysis = JSON.parse(content.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-competitor function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
