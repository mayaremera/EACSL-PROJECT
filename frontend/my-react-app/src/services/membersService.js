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
          console.warn(
            "Members table does not exist in Supabase. Please run the SQL script from SUPABASE_SETUP.md"
          );
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
          console.warn(
            "Members table does not exist in Supabase. Member saved locally only."
          );
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
          console.warn(
            "Members table does not exist in Supabase. Member updated locally only."
          );
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
          console.warn(
            "Members table does not exist in Supabase. Member deleted locally only."
          );
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
    return {
      id: supabaseMember.id,
      supabaseUserId: supabaseMember.supabase_user_id,
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
};
