import { supabase } from "../lib/supabase";

/**
 * Service to handle event registrations (Event registration form submissions)
 * Stores form data in Supabase event_registrations table
 */
export const eventRegistrationsService = {
  /**
   * Get all event registrations from Supabase
   * @returns {Promise<{data: Array|null, error: Object|null}>}
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .order("submitted_at", { ascending: false });

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
            "Event registrations table does not exist. Please create the table first."
          );
          return {
            data: [],
            error: {
              message:
                "Table does not exist. Please create the event_registrations table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        console.error("Error fetching event registrations from Supabase:", error);
        return { data: null, error };
      }

      // Map Supabase data to local format
      const mappedData = (data || []).map((registration) =>
        this.mapSupabaseToLocal(registration)
      );

      return { data: mappedData, error: null };
    } catch (err) {
      console.error("Exception fetching event registrations:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Get event registration by ID
   * @param {number} id - Registration ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event registration from Supabase:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception fetching event registration:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Add new event registration submission
   * @param {Object} registrationData - Registration form data
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async add(registrationData) {
    try {
      // Map local registration structure to Supabase structure
      const supabaseRegistration = this.mapLocalToSupabase(registrationData);

      const { data, error } = await supabase
        .from("event_registrations")
        .insert([supabaseRegistration])
        .select()
        .single();

      if (error) {
        // Check if it's a table not found error
        if (
          error.code === "PGRST205" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          console.warn(
            "Event registrations table does not exist. Please create the table first."
          );
          return {
            data: null,
            error: {
              message:
                "Table does not exist. Please create the event_registrations table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        // Check for RLS policy errors
        if (
          error.code === "42501" ||
          error.message?.includes("permission denied") ||
          error.message?.includes("new row violates row-level security")
        ) {
          return {
            data: null,
            error: {
              message:
                "Permission denied. The event_registrations table may have incorrect RLS policies. Please ensure the 'Allow public insert' policy is enabled in Supabase.",
              code: "RLS_POLICY_ERROR",
            },
          };
        }
        console.error("Error adding event registration to Supabase:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception adding event registration:", err); 
      return { data: null, error: err };
    }
  },

  /**
   * Update event registration status
   * @param {number} id - Registration ID
   * @param {string} status - New status ('pending', 'approved', 'rejected')
   * @param {string} notes - Optional review notes
   * @param {string} reviewedBy - Admin user ID (optional)
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async updateStatus(id, status, notes = "", reviewedBy = null) {
    try {
      const updateData = {
        status,
        reviewed_at: new Date().toISOString(),
      };

      if (notes) {
        updateData.review_notes = notes;
      }

      if (reviewedBy) {
        updateData.reviewed_by = reviewedBy;
      }

      const { data, error } = await supabase
        .from("event_registrations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();``

      if (error) {
        console.error("Error updating event registration status:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception updating event registration status:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Delete event registration
   * @param {number} id - Registration ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting event registration:", error);
        return { data: null, error };
      }

      return { data: { id }, error: null };
    } catch (err) {
      console.error("Exception deleting event registration:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Map local registration structure to Supabase structure
   * @param {Object} localRegistration - Local registration data
   * @returns {Object} Supabase registration data
   */
  mapLocalToSupabase(localRegistration) {
    return {
      event_id: localRegistration.eventId || localRegistration.event_id || null,
      full_name: localRegistration.fullName || localRegistration.full_name,
      email: localRegistration.email,
      phone: localRegistration.phone,
      organization: localRegistration.organization || null,
      membership_type: localRegistration.membershipType || localRegistration.membership_type,
      selected_tracks: Array.isArray(localRegistration.selectedTracks || localRegistration.selected_tracks)
        ? (localRegistration.selectedTracks || localRegistration.selected_tracks)
        : [],
      special_requirements: localRegistration.specialRequirements || localRegistration.special_requirements || null,
      registration_fee: localRegistration.registrationFee || localRegistration.registration_fee || 0,
      status: localRegistration.status || "pending",
      
      // Timestamps
      submitted_at: localRegistration.submittedAt || localRegistration.submitted_at || new Date().toISOString(),
      reviewed_at: localRegistration.reviewedAt || localRegistration.reviewed_at || null,
      reviewed_by: localRegistration.reviewedBy || localRegistration.reviewed_by || null,
      review_notes: localRegistration.reviewNotes || localRegistration.review_notes || null,
    };
  },

  /**
   * Map Supabase registration structure to local structure
   * @param {Object} supabaseRegistration - Supabase registration data
   * @returns {Object} Local registration data
   */
  mapSupabaseToLocal(supabaseRegistration) {
    return {
      id: supabaseRegistration.id?.toString() || null,
      type: "eventRegistration", // For backward compatibility
      eventId: supabaseRegistration.event_id,
      fullName: supabaseRegistration.full_name,
      email: supabaseRegistration.email,
      phone: supabaseRegistration.phone,
      organization: supabaseRegistration.organization || "",
      membershipType: supabaseRegistration.membership_type,
      selectedTracks: Array.isArray(supabaseRegistration.selected_tracks)
        ? supabaseRegistration.selected_tracks
        : [],
      specialRequirements: supabaseRegistration.special_requirements || "",
      registrationFee: parseFloat(supabaseRegistration.registration_fee || 0),
      status: supabaseRegistration.status || "pending",
      
      // Timestamps
      submittedAt: supabaseRegistration.submitted_at || supabaseRegistration.created_at,
      reviewedAt: supabaseRegistration.reviewed_at || null,
      reviewedBy: supabaseRegistration.reviewed_by || null,
      reviewNotes: supabaseRegistration.review_notes || null,
    };
  },
};

