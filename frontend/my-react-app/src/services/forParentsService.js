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
          // Not found - return null data, no error
          return { data: null, error: null };
        }
        console.error('Error fetching parent article from Supabase:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Exception fetching parent article:', err);
      return { data: null, error: err };
    }
  },

  // Add new parent article to Supabase
  async add(article) {
    try {
      // Map local article structure to Supabase structure
      const supabaseArticle = {
        title: article.title || '',
        excerpt: article.excerpt || '',
        date: article.date || '',
        author: article.author || '',
        article_url: article.articleUrl || '',
        image_url: article.imageUrl || null,
        image_path: article.imagePath || null,
      };

      const { data, error } = await supabase
        .from('for_parents')
        .insert([supabaseArticle])
        .select()
        .single();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
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
      // Map local article structure to Supabase structure
      const supabaseArticle = {
        title: article.title || '',
        excerpt: article.excerpt || '',
        date: article.date || '',
        author: article.author || '',
        article_url: article.articleUrl || '',
        image_url: article.imageUrl || null,
        image_path: article.imagePath || null,
      };

      const { data, error } = await supabase
        .from('for_parents')
        .update(supabaseArticle)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('For parents table does not exist in Supabase. Article updated locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the for_parents table first.', code: 'TABLE_NOT_FOUND' } };
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

