import { supabase } from '../lib/supabase';

// Supabase Therapy Programs Service
export const therapyProgramsService = {
  // Get all therapy programs from Supabase
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('therapy_programs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Therapy programs table does not exist in Supabase. Please run the SQL script from THERAPY_PROGRAMS_SUPABASE_SETUP.md');
          return { data: [], error: { message: 'Table does not exist. Please create the therapy_programs table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error fetching therapy programs from Supabase:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception fetching therapy programs:', err);
      return { data: null, error: err };
    }
  },

  // Get therapy program by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('therapy_programs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - return null data, no error
          return { data: null, error: null };
        }
        console.error('Error fetching therapy program from Supabase:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Exception fetching therapy program:', err);
      return { data: null, error: err };
    }
  },

  // Add new therapy program to Supabase
  async add(program) {
    try {
      // Map local program structure to Supabase structure
      const supabaseProgram = {
        title: program.title || '',
        description: program.description || '',
        icon: program.icon || 'MessageCircle',
        image_url: program.imageUrl || null,
        image_path: program.imagePath || null,
      };

      const { data, error } = await supabase
        .from('therapy_programs')
        .insert([supabaseProgram])
        .select()
        .single();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Therapy programs table does not exist in Supabase. Program saved locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the therapy_programs table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error adding therapy program to Supabase:', error);
        return { data: null, error };
      }
      
      // Map back to local structure
      const localProgram = this.mapSupabaseToLocal(data);
      return { data: localProgram, error: null };
    } catch (err) {
      console.error('Exception adding therapy program:', err);
      return { data: null, error: err };
    }
  },

  // Update therapy program in Supabase
  async update(id, program) {
    try {
      // Map local program structure to Supabase structure
      const supabaseProgram = {
        title: program.title || '',
        description: program.description || '',
        icon: program.icon || 'MessageCircle',
        image_url: program.imageUrl || null,
        image_path: program.imagePath || null,
      };

      const { data, error } = await supabase
        .from('therapy_programs')
        .update(supabaseProgram)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Therapy programs table does not exist in Supabase. Program updated locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the therapy_programs table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error updating therapy program in Supabase:', error);
        return { data: null, error };
      }
      
      // Map back to local structure
      const localProgram = this.mapSupabaseToLocal(data);
      return { data: localProgram, error: null };
    } catch (err) {
      console.error('Exception updating therapy program:', err);
      return { data: null, error: err };
    }
  },

  // Delete therapy program from Supabase
  async delete(id) {
    try {
      const { error } = await supabase
        .from('therapy_programs')
        .delete()
        .eq('id', id);
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Therapy programs table does not exist in Supabase. Program deleted locally only.');
          return { error: { message: 'Table does not exist. Please create the therapy_programs table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error deleting therapy program from Supabase:', error);
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Exception deleting therapy program:', err);
      return { error: err };
    }
  },

  // Upload image to TherapyBucket
  async uploadImage(file, fileName) {
    try {
      const fileExt = fileName.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('TherapyBucket')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image to TherapyBucket:', error);
        return { data: null, error };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('TherapyBucket')
        .getPublicUrl(filePath);

      return { 
        data: { 
          path: filePath, 
          url: urlData.publicUrl 
        }, 
        error: null 
      };
    } catch (err) {
      console.error('Exception uploading image:', err);
      return { data: null, error: err };
    }
  },

  // Delete image from TherapyBucket
  async deleteImage(filePath) {
    try {
      const { error } = await supabase.storage
        .from('TherapyBucket')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image from TherapyBucket:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Exception deleting image:', err);
      return { error: err };
    }
  },

  // Map Supabase program structure to local structure
  mapSupabaseToLocal(supabaseProgram) {
    // Use image_path if available, otherwise fall back to image_url
    let imageUrl = supabaseProgram.image_url || '';
    if (supabaseProgram.image_path) {
      const { data: urlData } = supabase.storage
        .from('TherapyBucket')
        .getPublicUrl(supabaseProgram.image_path);
      imageUrl = urlData.publicUrl;
    }

    return {
      id: supabaseProgram.id,
      title: supabaseProgram.title,
      description: supabaseProgram.description,
      icon: supabaseProgram.icon || 'MessageCircle',
      image: imageUrl, // Combined: path URL or external URL
      imageUrl: supabaseProgram.image_url,
      imagePath: supabaseProgram.image_path,
      createdAt: supabaseProgram.created_at,
      updatedAt: supabaseProgram.updated_at,
    };
  },

  // Map local program structure to Supabase structure
  mapLocalToSupabase(localProgram) {
    // Handle backward compatibility: if 'image' exists but 'imageUrl' doesn't, use 'image'
    const imageUrl = localProgram.imageUrl || (localProgram.image && !localProgram.imagePath ? localProgram.image : null);
    
    return {
      title: localProgram.title || '',
      description: localProgram.description || '',
      icon: localProgram.icon || 'MessageCircle',
      image_url: imageUrl,
      image_path: localProgram.imagePath || null,
    };
  },
};

