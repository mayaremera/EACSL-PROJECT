import { supabase } from '../lib/supabase';

// Supabase Courses Service
export const coursesService = {
  // Get all courses from Supabase
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Courses table does not exist in Supabase. Please run the SQL script from ENABLE_PUBLIC_READ_ACCESS.sql');
          return { data: [], error: { message: 'Table does not exist. Please create the courses table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error fetching courses from Supabase:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception fetching courses:', err);
      return { data: null, error: err };
    }
  },

  // Get course by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: { message: 'Course not found', code: 'NOT_FOUND' } };
        }
        console.error('Error fetching course from Supabase:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Exception fetching course:', err);
      return { data: null, error: err };
    }
  },

  // Add new course to Supabase
  async add(course) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([course])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding course to Supabase:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Exception adding course:', err);
      return { data: null, error: err };
    }
  },

  // Update course in Supabase
  async update(id, course) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(course)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating course in Supabase:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Exception updating course:', err);
      return { data: null, error: err };
    }
  },

  // Delete course from Supabase
  async delete(id) {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting course from Supabase:', error);
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Exception deleting course:', err);
      return { error: err };
    }
  },

  // Map Supabase course to local format
  mapSupabaseToLocal(supabaseCourse) {
    return {
      id: supabaseCourse.id,
      title: supabaseCourse.title || '',
      description: supabaseCourse.description || '',
      instructor: supabaseCourse.instructor || '',
      price: supabaseCourse.price || '',
      duration: supabaseCourse.duration || '',
      level: supabaseCourse.level || '',
      image: supabaseCourse.image_url || supabaseCourse.image_path || '',
      image_url: supabaseCourse.image_url || '',
      image_path: supabaseCourse.image_path || '',
      category: supabaseCourse.category || '',
      createdAt: supabaseCourse.created_at,
      updatedAt: supabaseCourse.updated_at,
    };
  },

  // Map local course to Supabase format
  mapLocalToSupabase(localCourse) {
    return {
      title: localCourse.title || '',
      description: localCourse.description || '',
      instructor: localCourse.instructor || '',
      price: localCourse.price || '',
      duration: localCourse.duration || '',
      level: localCourse.level || '',
      image_url: localCourse.image_url || localCourse.image || '',
      image_path: localCourse.image_path || '',
      category: localCourse.category || '',
    };
  },
};

