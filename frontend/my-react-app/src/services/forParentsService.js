import { supabase } from '../lib/supabase';

// Supabase For Parents Service
export const forParentsService = {
  // Get all parent articles from Supabase
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('for_parents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('For parents table does not exist in Supabase. Please run the SQL script from FOR_PARENTS_SUPABASE_SETUP.md');
          return { data: [], error: { message: 'Table does not exist. Please create the for_parents table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error fetching parent articles from Supabase:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception fetching parent articles:', err);
      return { data: null, error: err };
    }
  },

  // Get parent article by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('for_parents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - return null data, no error (same as articlesService)
          return { data: null, error: null };
        }
        console.error('Error fetching parent article from Supabase:', error);
        return { data: null, error };
      }
      
      // Map to local structure
      const localArticle = this.mapSupabaseToLocal(data);
      return { data: localArticle, error: null };
    } catch (err) {
      console.error('Exception fetching parent article:', err);
      return { data: null, error: err };
    }
  },

  // Add new parent article to Supabase
  async add(article) {
    try {
      // First, try to fetch one article to see what columns exist (don't use .single() to avoid error if empty)
      const { data: sampleArticles } = await supabase
        .from('for_parents')
        .select('*')
        .limit(1);
      
      // Build article object - start with basic fields (these should always exist)
      const supabaseArticle = {
        title: article.title || '',
        excerpt: article.excerpt || '',
        date: article.date || '',
        author: article.author || '',
        article_url: article.articleUrl || '',
        image_url: article.imageUrl || null,
        image_path: article.imagePath || null,
      };
      
      // Only add additional fields if they exist in the table schema
      if (sampleArticles && sampleArticles.length > 0) {
        const sampleArticle = sampleArticles[0];
        // Add any additional fields that exist in the table
        // (Currently only basic fields are used)
      }
      // If table is empty, just use basic fields

      const { data, error } = await supabase
        .from('for_parents')
        .insert([supabaseArticle])
        .select()
        .single();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || 
            (error.code === 'PGRST116' && error.message?.includes('schema cache'))) {
          console.warn('For parents table does not exist in Supabase. Article saved locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the for_parents table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error adding parent article to Supabase:', error);
        return { data: null, error };
      }
      
      // Map back to local structure
      const localArticle = this.mapSupabaseToLocal(data);
      return { data: localArticle, error: null };
    } catch (err) {
      console.error('Exception adding parent article:', err);
      return { data: null, error: err };
    }
  },

  // Update parent article in Supabase
  async update(id, article) {
    try {
      // First, try to fetch ANY article to see what columns exist in the table
      const { data: sampleArticles } = await supabase
        .from('for_parents')
        .select('*')
        .limit(1);
      
      // Build update object - start with basic fields (these should always exist)
      const supabaseArticle = {
        title: article.title || '',
        excerpt: article.excerpt || '',
        date: article.date || '',
        author: article.author || '',
        article_url: article.articleUrl || '',
        image_url: article.imageUrl || null,
        image_path: article.imagePath || null,
      };
      
      // Only add additional fields if they exist in the table schema
      if (sampleArticles && sampleArticles.length > 0) {
        const sampleArticle = sampleArticles[0];
        // Add any additional fields that exist in the table
        // (Currently only basic fields are used, but this allows for future expansion)
      }
      // If table is empty, just use basic fields

      const { data, error } = await supabase
        .from('for_parents')
        .update(supabaseArticle)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // Log the FULL error object to see what Supabase is actually saying
        console.error('❌ FULL Supabase Error Object:', JSON.stringify(error, null, 2));
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error statusCode:', error.statusCode);
        
        // PGRST205 means table doesn't exist
        // PGRST116 with "schema cache" also means table doesn't exist
        if (error.code === 'PGRST205' || 
            (error.code === 'PGRST116' && error.message?.includes('schema cache'))) {
          console.warn('For parents table does not exist in Supabase. Article updated locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the for_parents table first.', code: 'TABLE_NOT_FOUND' } };
        }
        
        // PGRST116 with "0 rows" means article doesn't exist, but table does
        if (error.code === 'PGRST116' && error.details?.includes('0 rows')) {
          console.warn('For parents article not found in Supabase, but table exists. Update will fail - article may need to be created first.');
        }
        
        // 400 Bad Request or 406 Not Acceptable means table exists but there's a problem
        if (error.status === 400 || error.statusCode === 400 || 
            error.status === 406 || error.statusCode === 406 ||
            error.code === 'PGRST204') {
          console.error('❌ 400/406 Error - Table exists but update failed. This usually means:');
          console.error('   - Column name mismatch');
          console.error('   - Missing required columns');
          console.error('   - Wrong data type');
          console.error('   - RLS policy blocking the update');
          return { data: null, error: { 
            message: `Bad Request: ${error.message || 'Check column names and RLS policies'}`,
            code: 'BAD_REQUEST',
            details: error.details,
            hint: error.hint,
            originalError: error
          }};
        }
        
        console.error('Error updating parent article in Supabase:', error);
        return { data: null, error };
      }
      
      // Map back to local structure
      const localArticle = this.mapSupabaseToLocal(data);
      return { data: localArticle, error: null };
    } catch (err) {
      console.error('Exception updating parent article:', err);
      return { data: null, error: err };
    }
  },

  // Delete parent article from Supabase
  async delete(id) {
    try {
      const { error } = await supabase
        .from('for_parents')
        .delete()
        .eq('id', id);
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('For parents table does not exist in Supabase. Article deleted locally only.');
          return { error: { message: 'Table does not exist. Please create the for_parents table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error deleting parent article from Supabase:', error);
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Exception deleting parent article:', err);
      return { error: err };
    }
  },

  // Upload image to ParentBucket
  async uploadImage(file, fileName) {
    try {
      const fileExt = fileName.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('ParentBucket')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image to ParentBucket:', error);
        return { data: null, error };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('ParentBucket')
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

  // Delete image from ParentBucket
  async deleteImage(filePath) {
    try {
      const { error } = await supabase.storage
        .from('ParentBucket')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image from ParentBucket:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Exception deleting image:', err);
      return { error: err };
    }
  },

  // Map Supabase article structure to local structure
  mapSupabaseToLocal(supabaseArticle) {
    // Use image_path if available, otherwise fall back to image_url
    let imageUrl = supabaseArticle.image_url || '';
    if (supabaseArticle.image_path) {
      const { data: urlData } = supabase.storage
        .from('ParentBucket')
        .getPublicUrl(supabaseArticle.image_path);
      imageUrl = urlData.publicUrl;
    }

    return {
      id: supabaseArticle.id,
      title: supabaseArticle.title,
      excerpt: supabaseArticle.excerpt,
      date: supabaseArticle.date,
      author: supabaseArticle.author,
      articleUrl: supabaseArticle.article_url,
      image: imageUrl, // Combined: path URL or external URL
      imageUrl: supabaseArticle.image_url,
      imagePath: supabaseArticle.image_path,
      createdAt: supabaseArticle.created_at,
      updatedAt: supabaseArticle.updated_at,
    };
  },

  // Map local article structure to Supabase structure
  mapLocalToSupabase(localArticle) {
    // Handle backward compatibility: if 'image' exists but 'imageUrl' doesn't, use 'image'
    const imageUrl = localArticle.imageUrl || (localArticle.image && !localArticle.imagePath ? localArticle.image : null);
    
    return {
      title: localArticle.title || '',
      excerpt: localArticle.excerpt || '',
      date: localArticle.date || '',
      author: localArticle.author || '',
      article_url: localArticle.articleUrl || '',
      image_url: imageUrl,
      image_path: localArticle.imagePath || null,
    };
  },
};

