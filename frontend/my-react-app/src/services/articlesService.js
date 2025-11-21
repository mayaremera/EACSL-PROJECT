import { supabase } from '../lib/supabase';

// Supabase Articles Service
export const articlesService = {
  // Get all articles from Supabase
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Articles table does not exist in Supabase. Please run the SQL script from ARTICLES_SUPABASE_SETUP.md');
          return { data: [], error: { message: 'Table does not exist. Please create the articles table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error fetching articles from Supabase:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception fetching articles:', err);
      return { data: null, error: err };
    }
  },

  // Get article by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - return null data, no error
          return { data: null, error: null };
        }
        console.error('Error fetching article from Supabase:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Exception fetching article:', err);
      return { data: null, error: err };
    }
  },

  // Get articles by category
  async getByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', category)
        .order('date', { ascending: false });
      
      if (error) {
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          return { data: [], error: { message: 'Table does not exist. Please create the articles table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error fetching articles by category from Supabase:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception fetching articles by category:', err);
      return { data: null, error: err };
    }
  },

  // Add new article to Supabase
  async add(article) {
    try {
      // Map local article structure to Supabase structure
      const supabaseArticle = {
        title_en: article.titleEn || '',
        category: article.category || '',
        date: article.date || new Date().toISOString().split('T')[0],
        image_url: article.imageUrl || null,
        image_path: article.imagePath || null,
        excerpt_en: article.excerptEn || '',
        url: article.url || '',
      };

      const { data, error } = await supabase
        .from('articles')
        .insert([supabaseArticle])
        .select()
        .single();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Articles table does not exist in Supabase. Article saved locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the articles table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error adding article to Supabase:', error);
        return { data: null, error };
      }
      
      // Map back to local structure
      const localArticle = this.mapSupabaseToLocal(data);
      return { data: localArticle, error: null };
    } catch (err) {
      console.error('Exception adding article:', err);
      return { data: null, error: err };
    }
  },

  // Update article in Supabase
  async update(id, article) {
    try {
      // Map local article structure to Supabase structure
      const supabaseArticle = {
        title_en: article.titleEn || '',
        category: article.category || '',
        date: article.date || new Date().toISOString().split('T')[0],
        image_url: article.imageUrl || null,
        image_path: article.imagePath || null,
        excerpt_en: article.excerptEn || '',
        url: article.url || '',
      };

      const { data, error } = await supabase
        .from('articles')
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
          console.warn('Articles table does not exist in Supabase. Article updated locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the articles table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error updating article in Supabase:', error);
        return { data: null, error };
      }
      
      // Map back to local structure
      const localArticle = this.mapSupabaseToLocal(data);
      return { data: localArticle, error: null };
    } catch (err) {
      console.error('Exception updating article:', err);
      return { data: null, error: err };
    }
  },

  // Delete article from Supabase
  async delete(id) {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Articles table does not exist in Supabase. Article deleted locally only.');
          return { error: { message: 'Table does not exist. Please create the articles table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error deleting article from Supabase:', error);
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Exception deleting article:', err);
      return { error: err };
    }
  },

  // Upload image to ArticlesBucket
  async uploadImage(file, fileName) {
    try {
      const fileExt = fileName.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('ArticlesBucket')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image to ArticlesBucket:', error);
        return { data: null, error };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('ArticlesBucket')
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

  // Delete image from ArticlesBucket
  async deleteImage(filePath) {
    try {
      const { error } = await supabase.storage
        .from('ArticlesBucket')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image from ArticlesBucket:', error);
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
        .from('ArticlesBucket')
        .getPublicUrl(supabaseArticle.image_path);
      imageUrl = urlData.publicUrl;
    }

    return {
      id: supabaseArticle.id,
      titleEn: supabaseArticle.title_en,
      category: supabaseArticle.category,
      date: supabaseArticle.date,
      image: imageUrl, // Combined: path URL or external URL
      imageUrl: supabaseArticle.image_url,
      imagePath: supabaseArticle.image_path,
      excerptEn: supabaseArticle.excerpt_en,
      url: supabaseArticle.url,
      createdAt: supabaseArticle.created_at,
      updatedAt: supabaseArticle.updated_at,
    };
  },

  // Map local article structure to Supabase structure
  mapLocalToSupabase(localArticle) {
    // Handle backward compatibility: if 'image' exists but 'imageUrl' doesn't, use 'image'
    const imageUrl = localArticle.imageUrl || (localArticle.image && !localArticle.imagePath ? localArticle.image : null);
    
    return {
      title_en: localArticle.titleEn || '',
      category: localArticle.category || '',
      date: localArticle.date || new Date().toISOString().split('T')[0],
      image_url: imageUrl,
      image_path: localArticle.imagePath || null,
      excerpt_en: localArticle.excerptEn || '',
      url: localArticle.url || '',
    };
  },
};

