import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/supabase/client';
import { toast } from '@/components/ui/use-toast';

const SetupEmailTables = () => {
  const [loading, setLoading] = useState(false);

  const createTables = async () => {
    setLoading(true);
    try {
      // Create SMTP config table
      const { error: smtpError } = await supabase
        .from('smtp_config')
        .select('id')
        .limit(1);
      
      if (smtpError && smtpError.code === 'PGRST116') {
        // Table doesn't exist, create it
        const { error: createError } = await supabase.rpc('create_smtp_table');
        if (createError) {
          console.error('Error creating SMTP table:', createError);
        }
      }

      // Create email templates table  
      const { error: templateError } = await supabase
        .from('email_templates')
        .select('id')
        .limit(1);
      
      if (templateError && templateError.code === 'PGRST116') {
        // Table doesn't exist, create it
        const { error: createError } = await supabase.rpc('create_email_templates_table');
        if (createError) {
          console.error('Error creating email templates table:', createError);
        }
      }

      toast({
        title: "Success",
        description: "Email tables created successfully!"
      });
    } catch (error) {
      console.error('Error creating tables:', error);
      toast({
        title: "Error",
        description: "Failed to create email tables.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Setup Email Tables</h1>
      <Button onClick={createTables} disabled={loading}>
        {loading ? 'Creating...' : 'Create Email Tables'}
      </Button>
    </div>
  );
};

export default SetupEmailTables;