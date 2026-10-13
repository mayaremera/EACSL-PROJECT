import { supabase } from '../lib/supabase';
import { buildStorageFilePath, validateImageFile } from '../utils/imageUploadUtils';

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
          return { data: [], error: { message: 'Table does not exist. Please create the therapy_programs table first.', code: 'TABLE_NOT_FOUND' } };
        }
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
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
          // Not found - return null data, no error (same as articlesService)
          return { data: null, error: null };
        }
        return { data: null, error };
      }
      
      // Map to local structure
      const localProgram = this.mapSupabaseToLocal(data);
      return { data: localProgram, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Add new therapy program to Supabase
  async add(program) {
    try {
      // First, try to fetch one program to see what columns exist (don't use .single() to avoid error if empty)
      const { data: samplePrograms } = await supabase
        .from('therapy_programs')
        .select('*')
        .limit(1);
      
      // Build program object - start with basic fields (these should always exist)
      const supabaseProgram = {
        title: program.title || '',
        description: program.description || '',
        icon: program.icon || 'MessageCircle',
        image_url: program.imageUrl || null,
        image_path: program.imagePath || null,
      };
      
      // Only add additional fields if they exist in the table schema
      if (samplePrograms && samplePrograms.length > 0) {
        const sampleProgram = samplePrograms[0];
        // Add any additional fields that exist in the table
        // (Currently only basic fields are used)
      }
      // If table is empty, just use basic fields

      const { data, error } = await supabase
        .from('therapy_programs')
        .insert([supabaseProgram])
        .select()
        .single();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || 
            (error.code === 'PGRST116' && error.message?.includes('schema cache'))) {
          return { data: null, error: { message: 'Table does not exist. Please create the therapy_programs table first.', code: 'TABLE_NOT_FOUND' } };
        }
        return { data: null, error };
      }
      
      // Map back to local structure
      const localProgram = this.mapSupabaseToLocal(data);
      return { data: localProgram, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Update therapy program in Supabase
  async update(id, program) {
    try {
      // First, try to fetch ANY program to see what columns exist in the table
      const { data: samplePrograms } = await supabase
        .from('therapy_programs')
        .select('*')
        .limit(1);
      
      // Build update object - start with basic fields (these should always exist)
      const supabaseProgram = {
        title: program.title || '',
        description: program.description || '',
        icon: program.icon || 'MessageCircle',
        image_url: program.imageUrl || null,
        image_path: program.imagePath || null,
      };
      
      // Only add additional fields if they exist in the table schema
      if (samplePrograms && samplePrograms.length > 0) {
        const sampleProgram = samplePrograms[0];
        // Add any additional fields that exist in the table
        // (Currently only basic fields are used, but this allows for future expansion)
      }
      // If table is empty, just use basic fields

      const { data, error } = await supabase
        .from('therapy_programs')
        .update(supabaseProgram)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // Log the FULL error object to see what Supabase is actually saying
        
        // PGRST205 means table doesn't exist
        // PGRST116 with "schema cache" also means table doesn't exist
        if (error.code === 'PGRST205' || 
            (error.code === 'PGRST116' && error.message?.includes('schema cache'))) {
          return { data: null, error: { message: 'Table does not exist. Please create the therapy_programs table first.', code: 'TABLE_NOT_FOUND' } };
        }
        
        // PGRST116 with "0 rows" means program doesn't exist, but table does
        if (error.code === 'PGRST116' && error.details?.includes('0 rows')) {
        }
        
        // 400 Bad Request or 406 Not Acceptable means table exists but there's a problem
        if (error.status === 400 || error.statusCode === 400 || 
            error.status === 406 || error.statusCode === 406 ||
            error.code === 'PGRST204') {
          return { data: null, error: { 
            message: `Bad Request: ${error.message || 'Check column names and RLS policies'}`,
            code: 'BAD_REQUEST',
            details: error.details,
            hint: error.hint,
            originalError: error
          }};
        }
        
        return { data: null, error };
      }
      
      // Map back to local structure
      const localProgram = this.mapSupabaseToLocal(data);
      return { data: localProgram, error: null };
    } catch (err) {
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
          return { error: { message: 'Table does not exist. Please create the therapy_programs table first.', code: 'TABLE_NOT_FOUND' } };
        }
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  },

  // Upload image to TherapyBucket
  async uploadImage(file) {
    try {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        return { data: null, error: { message: validation.error } };
      }

      const filePath = buildStorageFilePath('', file);

      const { data, error } = await supabase.storage
        .from('TherapyBucket')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
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
        return { error };
      }

      return { error: null };
    } catch (err) {
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

