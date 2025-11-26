import { supabase } from '../lib/supabase';

// Supabase Articles Service
export const articlesService = {
  // Get all articles from Supabase
  async getAll() {
    try {
      console.log('🔍 articlesService.getAll() - Fetching from Supabase...');
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
          console.warn('⚠️ Articles table does not exist in Supabase. Please run the SQL script from ARTICLES_SUPABASE_SETUP.md');
          return { data: [], error: { message: 'Table does not exist. Please create the articles table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('❌ Error fetching articles from Supabase:', error);
        console.error('Error details:', { code: error.code, message: error.message, details: error.details, hint: error.hint });
        return { data: null, error };
      }
      
      console.log(`✅ Successfully fetched ${data?.length || 0} articles from Supabase`);
      if (data && data.length > 0) {
        console.log('Sample article:', data[0]);
      }
      return { data: data || [], error: null };
    } catch (err) {
      console.error('❌ Exception fetching articles:', err);
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
          // Not found - return null data, no error (same as eventsService)
          return { data: null, error: null };
        }
        console.error('Error fetching article from Supabase:', error);
        return { data: null, error };
      }
      
      // Map to local structure
      const localArticle = this.mapSupabaseToLocal(data);
      return { data: localArticle, error: null };
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
      // First, try to fetch one article to see what columns exist (don't use .single() to avoid error if empty)
      const { data: sampleArticles } = await supabase
        .from('articles')
        .select('*')
        .limit(1);
      
      // Build article object - start with English fields only (these should always exist)
      const supabaseArticle = {
        title_en: article.titleEn || '',
        category: article.category || '',
        date: article.date || new Date().toISOString().split('T')[0],
        excerpt_en: article.excerptEn || '',
        url: article.url || '',
        image_url: article.imageUrl || null,
        image_path: article.imagePath || null,
      };
      
      // Only add Arabic fields if they exist in the table schema
      if (sampleArticles && sampleArticles.length > 0) {
        const sampleArticle = sampleArticles[0];
        if ('title_ar' in sampleArticle) {
          supabaseArticle.title_ar = article.titleAr || article.titleEn || '';
        }
        if ('category_ar' in sampleArticle) {
          supabaseArticle.category_ar = article.categoryAr || article.category || '';
        }
        if ('excerpt_ar' in sampleArticle) {
          supabaseArticle.excerpt_ar = article.excerptAr || article.excerptEn || '';
        }
      }
      // If table is empty or Arabic columns don't exist, just use English fields

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
      // First, try to fetch ANY article to see what columns exist in the table
      // This helps us know if Arabic columns exist
      const { data: sampleArticles } = await supabase
        .from('articles')
        .select('*')
        .limit(1);
      
      // Build update object - start with English fields only (these should always exist)
      const supabaseArticle = {
        title_en: article.titleEn || '',
        category: article.category || '',
        date: article.date || new Date().toISOString().split('T')[0],
        excerpt_en: article.excerptEn || '',
        url: article.url || '',
        image_url: article.imageUrl || null,
        image_path: article.imagePath || null,
      };
      
      // Only add Arabic fields if they exist in the table schema
      if (sampleArticles && sampleArticles.length > 0) {
        const sampleArticle = sampleArticles[0];
        if ('title_ar' in sampleArticle) {
          supabaseArticle.title_ar = article.titleAr || article.titleEn || '';
        }
        if ('category_ar' in sampleArticle) {
          supabaseArticle.category_ar = article.categoryAr || article.category || '';
        }
        if ('excerpt_ar' in sampleArticle) {
          supabaseArticle.excerpt_ar = article.excerptAr || article.excerptEn || '';
        }
      }
      // If table is empty or Arabic columns don't exist, just use English fields

      const { data, error } = await supabase
        .from('articles')
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
        
        // PGRST116 with "0 rows" means article not found (but table exists)
        // PGRST205 means table doesn't exist
        if (error.code === 'PGRST205' || 
            (error.code === 'PGRST116' && error.message?.includes('schema cache'))) {
          console.warn('Articles table does not exist in Supabase. Article updated locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the articles table first.', code: 'TABLE_NOT_FOUND' } };
        }
        
        // PGRST116 with "0 rows" or "Cannot coerce" means article doesn't exist, but table does
        // This is OK - we can still try to update (might create it)
        if (error.code === 'PGRST116' && error.details?.includes('0 rows')) {
          console.warn('Article not found in Supabase, but table exists. Update will fail - article may need to be created first.');
          // Don't treat this as table not found - it's a different issue
        }
        
        // 400 Bad Request means the table EXISTS but there's a problem with the data/columns
        if (error.status === 400 || error.statusCode === 400 || error.code === 'PGRST204') {
          console.error('❌ 400 Bad Request - Table exists but update failed. This usually means:');
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
    if (!supabaseArticle) {
      console.error('mapSupabaseToLocal: supabaseArticle is null or undefined');
      return null;
    }

    try {
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
        titleEn: supabaseArticle.title_en || '',
        titleAr: supabaseArticle.title_ar || supabaseArticle.title_en || '', // Fallback to English if Arabic doesn't exist
        category: supabaseArticle.category || '',
        categoryAr: supabaseArticle.category_ar || supabaseArticle.category || '', // Fallback to English if Arabic doesn't exist
        date: supabaseArticle.date || new Date().toISOString().split('T')[0],
        image: imageUrl, // Combined: path URL or external URL
        imageUrl: supabaseArticle.image_url || '',
        imagePath: supabaseArticle.image_path || '',
        excerptEn: supabaseArticle.excerpt_en || '',
        excerptAr: supabaseArticle.excerpt_ar || supabaseArticle.excerpt_en || '', // Fallback to English if Arabic doesn't exist
        url: supabaseArticle.url || '',
        createdAt: supabaseArticle.created_at,
        updatedAt: supabaseArticle.updated_at,
      };
    } catch (err) {
      console.error('Error mapping article:', supabaseArticle, err);
      return null;
    }
  },

  // Map local article structure to Supabase structure
  mapLocalToSupabase(localArticle) {
    // Handle backward compatibility: if 'image' exists but 'imageUrl' doesn't, use 'image'
    const imageUrl = localArticle.imageUrl || (localArticle.image && !localArticle.imagePath ? localArticle.image : null);
    
    return {
      title_ar: localArticle.titleAr || localArticle.titleEn || '', // Use English as fallback if Arabic not provided
      title_en: localArticle.titleEn || '',
      category: localArticle.category || '',
      category_ar: localArticle.categoryAr || localArticle.category || '', // Use English as fallback if Arabic not provided
      date: localArticle.date || new Date().toISOString().split('T')[0],
      image_url: imageUrl,
      image_path: localArticle.imagePath || null,
      excerpt_ar: localArticle.excerptAr || localArticle.excerptEn || '', // Use English as fallback if Arabic not provided
      excerpt_en: localArticle.excerptEn || '',
      url: localArticle.url || '',
    };
  },
};

