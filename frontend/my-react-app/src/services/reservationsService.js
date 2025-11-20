import { supabase } from "../lib/supabase";

/**
 * Service to handle reservations (Reservation/Assessment booking form submissions)
 * Stores form data in Supabase reservations table
 */
export const reservationsService = {
  /**
   * Get all reservations from Supabase
   * @returns {Promise<{data: Array|null, error: Object|null}>}
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("reservations")
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
            "Reservations table does not exist. Please create the table first."
          );
          return {
            data: [],
            error: {
              message:
                "Table does not exist. Please create the reservations table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        console.error("Error fetching reservations from Supabase:", error);
        return { data: null, error };
      }

      // Map Supabase data to local format
      const mappedData = (data || []).map((reservation) =>
        this.mapSupabaseToLocal(reservation)
      );

      return { data: mappedData, error: null };
    } catch (err) {
      console.error("Exception fetching reservations:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Get reservation by ID
   * @param {number} id - Reservation ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching reservation from Supabase:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception fetching reservation:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Add new reservation submission
   * @param {Object} reservationData - Reservation form data
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async add(reservationData) {
    try {
      // Map local reservation structure to Supabase structure
      const supabaseReservation = this.mapLocalToSupabase(reservationData);

      const { data, error } = await supabase
        .from("reservations")
        .insert([supabaseReservation])
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
            "Reservations table does not exist. Please create the table first."
          );
          return {
            data: null,
            error: {
              message:
                "Table does not exist. Please create the reservations table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        console.error("Error adding reservation to Supabase:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception adding reservation:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Update reservation status
   * @param {number} id - Reservation ID
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
        .from("reservations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating reservation status:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception updating reservation status:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Delete reservation
   * @param {number} id - Reservation ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting reservation:", error);
        return { data: null, error };
      }

      return { data: { id }, error: null };
    } catch (err) {
      console.error("Exception deleting reservation:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Map local reservation structure to Supabase structure
   * @param {Object} localReservation - Local reservation data
   * @returns {Object} Supabase reservation data
   */
  mapLocalToSupabase(localReservation) {
    return {
      kids_name: localReservation.kidsName,
      your_name: localReservation.yourName,
      phone_number: localReservation.phoneNumber,
      selected_assessments: Array.isArray(localReservation.selectedAssessments)
        ? localReservation.selectedAssessments
        : [],
      concern: localReservation.concern || "",
      status: localReservation.status || "pending",
      
      // Timestamps
      submitted_at: localReservation.submittedAt || new Date().toISOString(),
      reviewed_at: localReservation.reviewedAt || null,
      reviewed_by: localReservation.reviewedBy || null,
      review_notes: localReservation.reviewNotes || null,
    };
  },

  /**
   * Map Supabase reservation structure to local structure
   * @param {Object} supabaseReservation - Supabase reservation data
   * @returns {Object} Local reservation data
   */
  mapSupabaseToLocal(supabaseReservation) {
    return {
      id: supabaseReservation.id?.toString() || null,
      type: "reservation", // For backward compatibility
      kidsName: supabaseReservation.kids_name,
      yourName: supabaseReservation.your_name,
      phoneNumber: supabaseReservation.phone_number,
      selectedAssessments: Array.isArray(supabaseReservation.selected_assessments)
        ? supabaseReservation.selected_assessments
        : [],
      concern: supabaseReservation.concern || "",
      status: supabaseReservation.status || "pending",
      
      // Timestamps
      submittedAt: supabaseReservation.submitted_at || supabaseReservation.created_at,
      reviewedAt: supabaseReservation.reviewed_at || null,
      reviewedBy: supabaseReservation.reviewed_by || null,
      reviewNotes: supabaseReservation.review_notes || null,
    };
  },
};

