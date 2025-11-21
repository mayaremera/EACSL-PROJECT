import { supabase } from "../lib/supabase";

/**
 * Service to handle contact forms (Contact form submissions)
 * Stores form data in Supabase contact_forms table
 */
export const contactFormsService = {
  /**
   * Get all contact forms from Supabase
   * @returns {Promise<{data: Array|null, error: Object|null}>}
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("contact_forms")
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
            "Contact forms table does not exist. Please create the table first."
          );
          return {
            data: [],
            error: {
              message:
                "Table does not exist. Please create the contact_forms table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        console.error("Error fetching contact forms from Supabase:", error);
        return { data: null, error };
      }

      // Map Supabase data to local format
      const mappedData = (data || []).map((form) =>
        this.mapSupabaseToLocal(form)
      );

      return { data: mappedData, error: null };
    } catch (err) {
      console.error("Exception fetching contact forms:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Get contact form by ID
   * @param {number} id - Form ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from("contact_forms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching contact form from Supabase:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception fetching contact form:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Add new contact form submission
   * @param {Object} formData - Form submission data
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async add(formData) {
    try {
      // Map local form structure to Supabase structure
      const supabaseForm = this.mapLocalToSupabase(formData);

      const { data, error } = await supabase
        .from("contact_forms")
        .insert([supabaseForm])
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
            "Contact forms table does not exist. Please create the table first."
          );
          return {
            data: null,
            error: {
              message:
                "Table does not exist. Please create the contact_forms table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        console.error("Error adding contact form to Supabase:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception adding contact form:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Update contact form status
   * @param {number} id - Form ID
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
        .from("contact_forms")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating contact form status:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception updating contact form status:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Delete contact form
   * @param {number} id - Form ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from("contact_forms")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting contact form:", error);
        return { data: null, error };
      }

      return { data: { id }, error: null };
    } catch (err) {
      console.error("Exception deleting contact form:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Map local form structure to Supabase structure
   * @param {Object} localForm - Local form data
   * @returns {Object} Supabase form data
   */
  mapLocalToSupabase(localForm) {
    return {
      name: localForm.name,
      email: localForm.email,
      phone: localForm.phone || null,
      subject: localForm.subject,
      message: localForm.message,
      status: localForm.status || "pending",
      
      // Timestamps
      submitted_at: localForm.submittedAt || new Date().toISOString(),
      reviewed_at: localForm.reviewedAt || null,
      reviewed_by: localForm.reviewedBy || null,
      review_notes: localForm.reviewNotes || null,
    };
  },

  /**
   * Map Supabase form structure to local structure
   * @param {Object} supabaseForm - Supabase form data
   * @returns {Object} Local form data
   */
  mapSupabaseToLocal(supabaseForm) {
    return {
      id: supabaseForm.id?.toString() || null,
      type: "contactMessage", // For backward compatibility
      name: supabaseForm.name,
      email: supabaseForm.email,
      phone: supabaseForm.phone || "",
      subject: supabaseForm.subject,
      message: supabaseForm.message,
      status: supabaseForm.status || "pending",
      
      // Timestamps
      submittedAt: supabaseForm.submitted_at || supabaseForm.created_at,
      reviewedAt: supabaseForm.reviewed_at || null,
      reviewedBy: supabaseForm.reviewed_by || null,
      reviewNotes: supabaseForm.review_notes || null,
    };
  },
};

