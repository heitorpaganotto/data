import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TICKETS = [
  { value: 57.90, link: "https://api.pushcut.io/ebjCo5JnNiSP7Zo_46hrz/notifications/MinhaNotifica%C3%A7%C3%A3o" },
  { value: 97.98, link: "https://api.pushcut.io/ebjCo5JnNiSP7Zo_46hrz/notifications/MinhaNotifica%C3%A7%C3%A3o" },
  { value: 39.00, link: "https://api.pushcut.io/ebjCo5JnNiSP7Zo_46hrz/notifications/MinhaNotifica%C3%A7%C3%A3o" }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting ticket send process...');

    // Get system config (mainly for last_sent_at tracking)
    const { data: config, error: configError } = await supabase
      .from('system_config')
      .select('*')
      .single();

    if (configError) {
      console.error('Error fetching config:', configError);
      throw configError;
    }

    // Generate random interval between 6 and 19 minutes for next send
    const randomInterval = Math.floor(Math.random() * (19 - 6 + 1)) + 6;

    // Check if enough time has passed since last send (using the stored interval)
    if (config.last_sent_at) {
      const lastSent = new Date(config.last_sent_at);
      const now = new Date();
      const minutesPassed = (now.getTime() - lastSent.getTime()) / (1000 * 60);

      if (minutesPassed < config.interval_minutes) {
        console.log(`Not enough time passed. Minutes since last send: ${minutesPassed}`);
        return new Response(
          JSON.stringify({ 
            message: 'Not enough time passed since last send',
            minutes_remaining: config.interval_minutes - minutesPassed 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Select random ticket
    const randomTicket = TICKETS[Math.floor(Math.random() * TICKETS.length)];
    
    // Generate random delivery rate between 55.3% and 86.1%
    // Ensure it never ends with .0
    let deliveryRate: number;
    do {
      deliveryRate = Math.random() * (86.1 - 55.3) + 55.3;
    } while (Math.round(deliveryRate * 10) % 10 === 0);
    
    const deliveryRateStr = deliveryRate.toFixed(1);

    console.log(`Selected ticket: €${randomTicket.value}, Delivery Rate: ${deliveryRateStr}%, Next interval: ${randomInterval} minutes`);

    // Send to Pushcut API
    try {
      const pushcutResponse = await fetch(randomTicket.link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Ticket de €${randomTicket.value}`,
          title: 'Novo Ticket Enviado',
          delivery_rate: `${deliveryRateStr}%`
        })
      });

      console.log('Pushcut API response status:', pushcutResponse.status);
    } catch (pushcutError) {
      console.error('Error calling Pushcut API:', pushcutError);
      // Continue even if Pushcut fails
    }

    // Save to database
    const { error: insertError } = await supabase
      .from('tickets_sent')
      .insert({
        ticket_value: randomTicket.value,
        delivery_rate: parseFloat(deliveryRateStr),
        link_used: randomTicket.link
      });

    if (insertError) {
      console.error('Error inserting ticket:', insertError);
      throw insertError;
    }

    // Update last_sent_at and store the random interval for next check
    const { error: updateError } = await supabase
      .from('system_config')
      .update({ 
        last_sent_at: new Date().toISOString(),
        interval_minutes: randomInterval 
      })
      .eq('id', config.id);

    if (updateError) {
      console.error('Error updating config:', updateError);
      throw updateError;
    }

    console.log('Ticket sent successfully!');

    return new Response(
      JSON.stringify({ 
        success: true,
        ticket_value: randomTicket.value,
        delivery_rate: deliveryRateStr,
        next_interval_minutes: randomInterval
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-ticket function:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});