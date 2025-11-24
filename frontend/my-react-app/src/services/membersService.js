import { supabase } from "../lib/supabase";

// Supabase Members Service
export const membersService = {
  // Get all members from Supabase
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Check if it's a table not found error (PGRST205 = table not in schema cache, PGRST116 = record not found)
        if (
          error.code === "PGRST205" ||
          error.code === "PGRST116" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          // Table doesn't exist - this is expected if table hasn't been created yet
          // App works fine with localStorage, so this is just informational
          return {
            data: [],
            error: {
              message:
                "Table does not exist. Please create the members table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        console.error("Error fetching members from Supabase:", error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error("Exception fetching members:", err);
      return { data: null, error: err };
    }
  },

  // Get member by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching member from Supabase:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error("Exception fetching member:", err);
      return { data: null, error: err };
    }
  },

  // Get member by Supabase user ID
  async getByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("supabase_user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("Error fetching member by user ID:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error("Exception fetching member by user ID:", err);
      return { data: null, error: err };
    }
  },

  // Add new member to Supabase
  async add(member) {
    try {
      // Map local member structure to Supabase structure
      const supabaseMember = this.mapLocalToSupabase(member);

      const { data, error } = await supabase
        .from("members")
        .insert([supabaseMember])
        .select()
        .single();

      if (error) {
        // Check if it's a table not found error
        if (
          error.code === "PGRST205" ||
          error.code === "PGRST116" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          // Table doesn't exist - this is expected if table hasn't been created yet
          return {
            data: null,
            error: {
              message:
                "Table does not exist. Please create the members table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        console.error("Error adding member to Supabase:", error);
        return { data: null, error };
      }

      // Map back to local structure
      const localMember = this.mapSupabaseToLocal(data);
      return { data: localMember, error: null };
    } catch (err) {
      console.error("Exception adding member:", err);
      return { data: null, error: err };
    }
  },

  // Update member in Supabase
  async update(id, member) {
    try {
      // Map local member structure to Supabase structure
      const supabaseMember = this.mapLocalToSupabase(member);

      const { data, error } = await supabase
        .from("members")
        .update(supabaseMember)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        // Check if it's a table not found error
        if (
          error.code === "PGRST205" ||
          error.code === "PGRST116" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          // Table doesn't exist - this is expected if table hasn't been created yet
          // Don't log as warning, just return the error code for handling
          return {
            data: null,
            error: {
              message:
                "Table does not exist. Please create the members table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        console.error("Error updating member in Supabase:", error);
        return { data: null, error };
      }

      // Map back to local structure
      const localMember = this.mapSupabaseToLocal(data);
      return { data: localMember, error: null };
    } catch (err) {
      console.error("Exception updating member:", err);
      return { data: null, error: err };
    }
  },

  // Delete member from Supabase
  async delete(id) {
    try {
      const { error } = await supabase.from("members").delete().eq("id", id);

      if (error) {
        // Check if it's a table not found error
        if (
          error.code === "PGRST205" ||
          error.code === "PGRST116" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          // Table doesn't exist - this is expected if table hasn't been created yet
          return {
            error: {
              message:
                "Table does not exist. Please create the members table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        console.error("Error deleting member from Supabase:", error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error("Exception deleting member:", err);
      return { error: err };
    }
  },

  // Get active members count
  async getActiveCount() {
    try {
      const { count, error } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (error) {
        console.error("Error getting active members count:", error);
        return { count: 0, error };
      }

      return { count: count || 0, error: null };
    } catch (err) {
      console.error("Exception getting active members count:", err);
      return { count: 0, error: err };
    }
  },

  // Map Supabase member structure to local structure
  mapSupabaseToLocal(supabaseMember) {
    // Handle both supabase_user_id and auth_uid (some views/aliases may use auth_uid)
    const supabaseUserId = supabaseMember.supabase_user_id || supabaseMember.auth_uid || null;
    
    return {
      id: supabaseMember.id,
      supabaseUserId: supabaseUserId,
      name: supabaseMember.name,
      email: supabaseMember.email,
      role: supabaseMember.role,
      nationality: supabaseMember.nationality,
      flagCode: supabaseMember.flag_code,
      description: supabaseMember.description,
      fullDescription: supabaseMember.full_description,
      membershipDate: supabaseMember.membership_date,
      isActive: supabaseMember.is_active,
      activeTill: supabaseMember.active_till,
      certificates: supabaseMember.certificates || [],
      phone: supabaseMember.phone,
      location: supabaseMember.location,
      website: supabaseMember.website,
      linkedin: supabaseMember.linkedin,
      image: supabaseMember.image,
      totalMoneySpent: supabaseMember.total_money_spent || "0 EGP",
      coursesEnrolled: supabaseMember.courses_enrolled || 0,
      totalHoursLearned: supabaseMember.total_hours_learned || 0,
      activeCourses: supabaseMember.active_courses || [],
      completedCourses: supabaseMember.completed_courses || [],
    };
  },

  // Map local member structure to Supabase structure
  mapLocalToSupabase(localMember) {
    return {
      supabase_user_id: localMember.supabaseUserId || null,
      name: localMember.name || "",
      email: localMember.email || "",
      role: localMember.role || "Member",
      nationality: localMember.nationality || "Egyptian",
      flag_code: localMember.flagCode || "eg",
      description: localMember.description || "",
      full_description: localMember.fullDescription || "",
      membership_date: localMember.membershipDate || "",
      is_active:
        localMember.isActive !== undefined ? localMember.isActive : true,
      active_till: localMember.activeTill || "",
      certificates: localMember.certificates || [],
      phone: localMember.phone || "",
      location: localMember.location || "",
      website: localMember.website || "",
      linkedin: localMember.linkedin || "",
      image: localMember.image || "",
      total_money_spent: localMember.totalMoneySpent || "0 EGP",
      courses_enrolled: localMember.coursesEnrolled || 0,
      total_hours_learned: localMember.totalHoursLearned || 0,
      active_courses: localMember.activeCourses || [],
      completed_courses: localMember.completedCourses || [],
    };
  },

  // Upload image to dashboardmemberimages bucket
  async uploadImage(file, fileName) {
    try {
      if (!file || !(file instanceof File)) {
        console.error('Invalid file provided to uploadImage');
        return { data: null, error: { message: 'Invalid file' } };
      }

      const fileExt = fileName.split('.').pop() || 'png';
      // Upload directly to bucket root (no folder) for dashboardmemberimages
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('📤 Uploading file to dashboardmemberimages:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: filePath,
        bucket: 'dashboardmemberimages'
      });

      const { data, error } = await supabase.storage
        .from('dashboardmemberimages')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error uploading image to dashboardmemberimages:', error);
        console.error('Error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error,
          code: error.code
        });
        return { data: null, error };
      }

      if (!data) {
        console.error('❌ Upload returned no data');
        return { data: null, error: { message: 'Upload returned no data' } };
      }

      console.log('✅ Upload successful, data:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('dashboardmemberimages')
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl;
      console.log('✅ Public URL generated:', publicUrl);

      if (!publicUrl) {
        console.error('❌ Failed to get public URL');
        return { data: null, error: { message: 'Failed to get public URL' } };
      }

      return { 
        data: { 
          path: filePath, 
          url: publicUrl 
        }, 
        error: null 
      };
    } catch (err) {
      console.error('❌ Exception uploading image:', err);
      return { data: null, error: err };
    }
  },

  // Delete image from dashboardmemberimages bucket
  async deleteImage(filePath) {
    try {
      // Extract just the filename from the path or URL
      let pathToDelete = filePath;
      
      // If it's a full URL, extract the path
      if (filePath.includes('dashboardmemberimages')) {
        const urlParts = filePath.split('dashboardmemberimages/');
        if (urlParts.length > 1) {
          pathToDelete = urlParts[1].split('?')[0]; // Remove query params if any
        }
      }

      const { error } = await supabase.storage
        .from('dashboardmemberimages')
        .remove([pathToDelete]);

      if (error) {
        console.error('Error deleting image from dashboardmemberimages:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Exception deleting image:', err);
      return { error: err };
    }
  },
};
