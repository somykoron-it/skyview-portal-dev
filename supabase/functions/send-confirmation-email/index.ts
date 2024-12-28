import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting confirmation email process");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Missing RESEND_API_KEY configuration");
    }

    const { email, confirmationUrl } = await req.json();
    
    if (!email || !confirmationUrl) {
      console.error("Missing required fields:", { email, confirmationUrl });
      throw new Error("Missing required fields");
    }

    console.log("Sending confirmation email to:", email);
    console.log("Confirmation URL:", confirmationUrl);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SkyGuide <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to SkyGuide - Confirm Your Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to SkyGuide!</h2>
            <p>Thank you for signing up. Please click the link below to confirm your email address:</p>
            <p style="margin: 20px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Confirm Email Address
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
          </div>
        `,
      }),
    });

    const responseData = await res.text();
    console.log("Resend API response:", responseData);

    if (!res.ok) {
      console.error("Error from Resend API:", responseData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send confirmation email",
          details: responseData,
          status: res.status
        }),
        {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "Confirmation email sent successfully",
        details: responseData 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process request",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);