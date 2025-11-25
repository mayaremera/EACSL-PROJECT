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
        // Check if it's a table not found error
        if (
          error.code === 'PGRST205' ||
          error.code === 'PGRST116' ||
          error.message?.includes('relation') ||
          error.message?.includes('does not exist') ||
          error.message?.includes('schema cache')
        ) {
          console.warn('Courses table does not exist in Supabase. Please create the table first.');
          return {
            data: null,
            error: {
              message: 'Table does not exist. Please create the courses table first.',
              code: 'TABLE_NOT_FOUND',
            },
          };
        }
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
        // Check if it's a table not found error
        if (
          error.code === 'PGRST205' ||
          error.code === 'PGRST116' ||
          error.message?.includes('relation') ||
          error.message?.includes('does not exist') ||
          error.message?.includes('schema cache')
        ) {
          console.warn('Courses table does not exist in Supabase. Please create the table first.');
          return {
            data: null,
            error: {
              message: 'Table does not exist. Please create the courses table first.',
              code: 'TABLE_NOT_FOUND',
            },
          };
        }
        // Check if course not found
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          return {
            data: null,
            error: {
              message: 'Course not found',
              code: 'NOT_FOUND',
            },
          };
        }
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

  // Upload course image to CoursesBucket
  async uploadCourseImage(file, fileName) {
    try {
      if (!file || !(file instanceof File)) {
        console.error('Invalid file provided to uploadCourseImage');
        return { data: null, error: { message: 'Invalid file' } };
      }

      const fileExt = fileName.split('.').pop() || 'png';
      const filePath = `course-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('📤 Uploading course image to CoursesBucket:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: filePath,
        bucket: 'CoursesBucket'
      });

      const { data, error } = await supabase.storage
        .from('CoursesBucket')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error uploading course image to CoursesBucket:', error);
        return { data: null, error };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('CoursesBucket')
        .getPublicUrl(filePath);

      return {
        data: {
          path: filePath,
          url: urlData?.publicUrl || ''
        },
        error: null
      };
    } catch (err) {
      console.error('Exception uploading course image:', err);
      return { data: null, error: err };
    }
  },

  // Upload instructor image to CoursesBucket
  async uploadInstructorImage(file, fileName) {
    try {
      if (!file || !(file instanceof File)) {
        console.error('Invalid file provided to uploadInstructorImage');
        return { data: null, error: { message: 'Invalid file' } };
      }

      const fileExt = fileName.split('.').pop() || 'png';
      const filePath = `instructor-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('📤 Uploading instructor image to CoursesBucket:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: filePath,
        bucket: 'CoursesBucket'
      });

      const { data, error } = await supabase.storage
        .from('CoursesBucket')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error uploading instructor image to CoursesBucket:', error);
        return { data: null, error };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('CoursesBucket')
        .getPublicUrl(filePath);

      return {
        data: {
          path: filePath,
          url: urlData?.publicUrl || ''
        },
        error: null
      };
    } catch (err) {
      console.error('Exception uploading instructor image:', err);
      return { data: null, error: err };
    }
  },

  // Delete image from CoursesBucket
  async deleteImage(filePath) {
    try {
      if (!filePath) {
        return { error: null };
      }

      const { error } = await supabase.storage
        .from('CoursesBucket')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image from CoursesBucket:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Exception deleting image:', err);
      return { error: err };
    }
  },

  // Map Supabase course to local format
  mapSupabaseToLocal(supabaseCourse) {
    return {
      id: supabaseCourse.id,
      title: supabaseCourse.title || '',
      titleEn: supabaseCourse.title_en || supabaseCourse.titleEn || '',
      titleAr: supabaseCourse.title_ar || supabaseCourse.titleAr || '',
      description: supabaseCourse.description || '',
      descriptionShort: supabaseCourse.description_short || supabaseCourse.descriptionShort || '',
      instructor: supabaseCourse.instructor || '',
      instructorTitle: supabaseCourse.instructor_title || supabaseCourse.instructorTitle || '',
      instructorBio: supabaseCourse.instructor_bio || supabaseCourse.instructorBio || '',
      instructorImage: supabaseCourse.instructor_image || supabaseCourse.instructorImage || '',
      instructor_image_url: supabaseCourse.instructor_image || supabaseCourse.instructor_image_url || '',
      instructor_image_path: supabaseCourse.instructor_image_path || '',
      price: supabaseCourse.price || '',
      duration: supabaseCourse.duration || '',
      level: supabaseCourse.level || '',
      skillLevel: supabaseCourse.skill_level || supabaseCourse.skillLevel || supabaseCourse.level || '',
      category: supabaseCourse.category || '',
      categoryAr: supabaseCourse.category_ar || supabaseCourse.categoryAr || '',
      lessons: typeof supabaseCourse.lessons === 'number' ? supabaseCourse.lessons : (parseInt(supabaseCourse.lessons) || 0),
      lectures: typeof supabaseCourse.lectures === 'number' ? supabaseCourse.lectures : (parseInt(supabaseCourse.lectures) || 0),
      students: typeof supabaseCourse.students === 'number' ? supabaseCourse.students : (parseInt(supabaseCourse.students) || 0),
      enrolled: typeof supabaseCourse.enrolled === 'number' ? supabaseCourse.enrolled : (parseInt(supabaseCourse.enrolled) || 0),
      language: supabaseCourse.language || 'English',
      classTime: supabaseCourse.class_time || supabaseCourse.classTime || '',
      startDate: supabaseCourse.start_date || supabaseCourse.startDate || '',
      moneyBackGuarantee: supabaseCourse.money_back_guarantee || supabaseCourse.moneyBackGuarantee || '',
      learningOutcomes: Array.isArray(supabaseCourse.learning_outcomes) 
        ? supabaseCourse.learning_outcomes 
        : (Array.isArray(supabaseCourse.learningOutcomes) ? supabaseCourse.learningOutcomes : []),
      curriculum: Array.isArray(supabaseCourse.curriculum) ? supabaseCourse.curriculum : [],
      // Use image_url if available (from storage), otherwise fall back to image_path or image
      image: supabaseCourse.image_url || supabaseCourse.image_path || supabaseCourse.image || '',
      image_url: supabaseCourse.image_url || '',
      image_path: supabaseCourse.image_path || '',
      createdAt: supabaseCourse.created_at,
      updatedAt: supabaseCourse.updated_at,
    };
  },

  // Map local course to Supabase format
  mapLocalToSupabase(localCourse) {
    // Map all fields from the form to Supabase format (snake_case)
    const mapped = {
      title: localCourse.title || '',
      title_en: localCourse.titleEn || localCourse.title_en || '',
      title_ar: localCourse.titleAr || localCourse.title_ar || '',
      description: localCourse.description || '',
      description_short: localCourse.descriptionShort || localCourse.description_short || '',
      instructor: localCourse.instructor || '',
      instructor_title: localCourse.instructorTitle || localCourse.instructor_title || '',
      instructor_bio: localCourse.instructorBio || localCourse.instructor_bio || '',
      instructor_image: localCourse.instructor_image_url || localCourse.instructorImage || localCourse.instructor_image || '',
      instructor_image_path: localCourse.instructor_image_path || '',
      price: localCourse.price || '',
      duration: localCourse.duration || '',
      level: localCourse.level || '',
      skill_level: localCourse.skillLevel || localCourse.skill_level || localCourse.level || '',
      category: localCourse.category || '',
      category_ar: localCourse.categoryAr || localCourse.category_ar || '',
      lessons: typeof localCourse.lessons === 'number' ? localCourse.lessons : (parseInt(localCourse.lessons) || 0),
      lectures: typeof localCourse.lectures === 'number' ? localCourse.lectures : (parseInt(localCourse.lectures) || 0),
      students: typeof localCourse.students === 'number' ? localCourse.students : (parseInt(localCourse.students) || 0),
      enrolled: typeof localCourse.enrolled === 'number' ? localCourse.enrolled : (parseInt(localCourse.enrolled) || 0),
      language: localCourse.language || 'English',
      class_time: localCourse.classTime || localCourse.class_time || '',
      start_date: localCourse.startDate || localCourse.start_date || '',
      money_back_guarantee: localCourse.moneyBackGuarantee || localCourse.money_back_guarantee || '',
      learning_outcomes: Array.isArray(localCourse.learningOutcomes) 
        ? localCourse.learningOutcomes 
        : (Array.isArray(localCourse.learning_outcomes) ? localCourse.learning_outcomes : []),
      curriculum: Array.isArray(localCourse.curriculum) ? localCourse.curriculum : [],
      image_url: localCourse.image_url || localCourse.image || '',
      image_path: localCourse.image_path || '',
    };
    
    // Remove empty strings for optional fields to avoid issues
    Object.keys(mapped).forEach(key => {
      if (mapped[key] === '' || mapped[key] === null || mapped[key] === undefined) {
        delete mapped[key];
      }
    });
    
    return mapped;
  },
};

