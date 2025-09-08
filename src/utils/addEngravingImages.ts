import { supabase } from '@/supabase/client';

const sampleEngravingImages = [
  {
    image_url: '/images/smart_switch/one gang.webp',
    alt_text: 'Single Gang Switch Engraving',
    position: 1,
    image_type: 'engraving' as const
  },
  {
    image_url: '/images/smart_switch/3 gang mechanical.webp', 
    alt_text: '3 Gang Switch Engraving',
    position: 2,
    image_type: 'engraving' as const
  },
  {
    image_url: '/images/smart_switch/fan touch switch.webp',
    alt_text: 'Fan Touch Switch Engraving', 
    position: 3,
    image_type: 'engraving' as const
  },
  {
    image_url: '/images/smart_switch/4 gang touch light.webp',
    alt_text: '4 Gang Touch Light Engraving',
    position: 4, 
    image_type: 'engraving' as const
  }
];

export async function addEngravingImages() {
  try {
    console.log('Checking for existing engraving images...');
    
    const { data: existing } = await supabase
      .from('product_images')
      .select('id')
      .eq('image_type', 'engraving')
      .limit(1);

    console.log('Existing engraving images:', existing);

    if (existing && existing.length > 0) {
      console.log('Engraving images already exist, skipping insert');
      return existing;
    }

    console.log('No existing engraving images found, inserting sample images...');
    
    const { data, error } = await supabase
      .from('product_images')
      .insert(sampleEngravingImages)
      .select();

    if (error) {
      console.error('Error adding engraving images:', error);
      throw error;
    }

    console.log('Successfully added engraving images:', data);
    return data;
  } catch (error) {
    console.error('Failed to add engraving images:', error);
    throw error;
  }
}