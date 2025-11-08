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
    const { idea, deeperAnalysis = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Churning idea:", idea);

    const systemPrompt = `You are Manthan AI, an ancient wisdom keeper inspired by the Samudra Manthan (Ocean Churning). Your role is to reveal BOTH the Amrit (nectar/benefits) and Halahala (poison/risks) hidden within every idea.

Follow these guidelines:
1. Be brutally honest but balanced - show both potential and pitfalls
2. Consider practical, ethical, financial, and social dimensions
3. Identify hidden risks that others might miss
4. Highlight genuine opportunities
5. Provide a realistic Balanced Viability Index (0-100)

Your analysis should help people make wiser decisions by seeing the complete picture - both the treasures and dangers of their chosen path.

${deeperAnalysis ? "DEEPER ANALYSIS MODE: Provide more detailed reasoning, explore edge cases, and dig into second-order effects." : ""}`;

    const userPrompt = `Analyze this idea/goal and reveal its complete nature:

"${idea}"

Provide your analysis in this exact JSON format:
{
  "amrit": {
    "title": "Amrit View: The Nectar",
    "insights": [
      "First major benefit or opportunity",
      "Second major benefit or opportunity",
      "Third major benefit or opportunity"
    ]
  },
  "halahala": {
    "title": "Halahala View: The Poison",
    "risks": [
      "First major risk or challenge",
      "Second major risk or challenge",
      "Third major risk or challenge"
    ]
  },
  "bvi": {
    "score": 75,
    "reasoning": "Brief explanation of the score based on the balance of opportunities and risks"
  },
  "shivaMode": {
    "title": "Shiva Mode: Absorbing the Poison",
    "mitigations": [
      "First practical way to handle the biggest risk",
      "Second practical way to handle another major risk",
      "Third strategic approach to turn challenges into advantages"
    ]
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
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log("AI response:", content);

    let analysis;
    try {
      analysis = JSON.parse(content);
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
    console.error("Error in churn-idea function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
