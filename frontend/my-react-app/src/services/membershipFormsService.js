import { supabase } from "../lib/supabase";

/**
 * Service to handle membership forms (Become a Member form submissions)
 * Stores form data in Supabase membership_forms table
 */
export const membershipFormsService = {
  /**
   * Get all membership forms from Supabase
   * @returns {Promise<{data: Array|null, error: Object|null}>}
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("membership_forms")
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
            "Membership forms table does not exist. Please create the table first."
          );
          return {
            data: [],
            error: {
              message:
                "Table does not exist. Please create the membership_forms table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        console.error("Error fetching membership forms from Supabase:", error);
        return { data: null, error };
      }

      // Map Supabase data to local format
      const mappedData = (data || []).map((form) =>
        this.mapSupabaseToLocal(form)
      );

      return { data: mappedData, error: null };
    } catch (err) {
      console.error("Exception fetching membership forms:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Get membership form by ID
   * @param {number} id - Form ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from("membership_forms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching membership form from Supabase:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception fetching membership form:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Add new membership form submission
   * @param {Object} formData - Form submission data
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async add(formData) {
    try {
      // Map local form structure to Supabase structure
      const supabaseForm = this.mapLocalToSupabase(formData);

      const { data, error } = await supabase
        .from("membership_forms")
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
            "Membership forms table does not exist. Please create the table first."
          );
          return {
            data: null,
            error: {
              message:
                "Table does not exist. Please create the membership_forms table first.",
              code: "TABLE_NOT_FOUND",
            },
          };
        }
        // Check if it's a duplicate email error (unique constraint violation)
        if (
          error.code === "23505" ||
          error.message?.includes("unique constraint") ||
          error.message?.includes("duplicate key")
        ) {
          return {
            data: null,
            error: {
              message:
                "An application with this email is already pending. Please wait for your current application to be reviewed.",
              code: "DUPLICATE_EMAIL",
            },
          };
        }
        console.error("Error adding membership form to Supabase:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception adding membership form:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Update membership form status
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
        .from("membership_forms")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating membership form status:", error);
        return { data: null, error };
      }

      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error("Exception updating membership form status:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Delete membership form
   * @param {number} id - Form ID
   * @returns {Promise<{data: Object|null, error: Object|null}>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from("membership_forms")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting membership form:", error);
        return { data: null, error };
      }

      return { data: { id }, error: null };
    } catch (err) {
      console.error("Exception deleting membership form:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Upload file to member-forms-bucket
   * @param {File} file - File to upload
   * @param {string} folder - Folder path (e.g., 'profile-images', 'id-cards')
   * @param {string} fileName - Base file name
   * @returns {Promise<{path: string|null, url: string|null, error: Object|null}>}
   */
  async uploadFile(file, folder, fileName) {
    if (!file) {
      return { path: null, url: null, error: null };
    }

    try {
      const fileExt = file.name.split(".").pop();
      const uniqueFileName = `${fileName}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${folder}/${uniqueFileName}`;

      // Upload to member-forms-bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("member-forms-bucket")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // Check for bucket not found error
        if (
          uploadError.message?.includes("bucket") ||
          uploadError.message?.includes("not found") ||
          uploadError.code === "404"
        ) {
          console.warn(
            `Supabase Storage bucket "member-forms-bucket" not found:`,
            uploadError
          );
          return {
            path: null,
            url: null,
            error: {
              message: `Bucket "member-forms-bucket" not found. Please create it in Supabase Storage.`,
              code: "BUCKET_NOT_FOUND",
            },
          };
        }

        // Check for RLS policy error
        if (
          uploadError.message?.includes("row-level security") ||
          uploadError.message?.includes("RLS")
        ) {
          console.warn(
            "Storage bucket RLS policy error:",
            uploadError
          );
          return {
            path: null,
            url: null,
            error: {
              message:
                "Bucket requires RLS policies for public uploads. See MEMBERSHIP_FORMS_SUPABASE_SETUP.md",
              code: "RLS_POLICY_REQUIRED",
            },
          };
        }

        console.error("Error uploading file to storage:", uploadError);
        return { path: null, url: null, error: uploadError };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("member-forms-bucket")
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData?.publicUrl || null,
        error: null,
      };
    } catch (err) {
      console.error("Exception uploading file:", err);
      return { path: null, url: null, error: err };
    }
  },

  /**
   * Map local form structure to Supabase structure
   * @param {Object} localForm - Local form data
   * @returns {Object} Supabase form data
   */
  mapLocalToSupabase(localForm) {
    return {
      username: localForm.username,
      email: localForm.email,
      password: localForm.password, // Should be encrypted/hashed in production
      specialty: Array.isArray(localForm.specialty)
        ? localForm.specialty
        : [],
      location: localForm.location || "",
      previous_work: localForm.previousWork || "",
      status: localForm.status || "pending",
      
      // File paths and URLs
      profile_image_path: localForm.profileImage?.storagePath || null,
      profile_image_url: localForm.profileImage?.url || null,
      
      id_image_path: localForm.idImage?.storagePath || null,
      id_image_url: localForm.idImage?.url || null,
      
      graduation_cert_path: localForm.graduationCert?.storagePath || null,
      graduation_cert_url: localForm.graduationCert?.url || null,
      
      cv_path: localForm.cv?.storagePath || null,
      cv_url: localForm.cv?.url || null,
      
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
      username: supabaseForm.username,
      email: supabaseForm.email,
      password: supabaseForm.password,
      specialty: Array.isArray(supabaseForm.specialty)
        ? supabaseForm.specialty
        : [],
      location: supabaseForm.location || "",
      previousWork: supabaseForm.previous_work || "",
      status: supabaseForm.status || "pending",
      
      // File data
      profileImage: supabaseForm.profile_image_path
        ? {
            name: supabaseForm.profile_image_path.split("/").pop(),
            storagePath: supabaseForm.profile_image_path,
            url: supabaseForm.profile_image_url,
            uploaded: true,
          }
        : null,
      
      idImage: supabaseForm.id_image_path
        ? {
            name: supabaseForm.id_image_path.split("/").pop(),
            storagePath: supabaseForm.id_image_path,
            url: supabaseForm.id_image_url,
            uploaded: true,
          }
        : null,
      
      graduationCert: supabaseForm.graduation_cert_path
        ? {
            name: supabaseForm.graduation_cert_path.split("/").pop(),
            storagePath: supabaseForm.graduation_cert_path,
            url: supabaseForm.graduation_cert_url,
            uploaded: true,
          }
        : null,
      
      cv: supabaseForm.cv_path
        ? {
            name: supabaseForm.cv_path.split("/").pop(),
            storagePath: supabaseForm.cv_path,
            url: supabaseForm.cv_url,
            uploaded: true,
          }
        : null,
      
      // Timestamps
      submittedAt: supabaseForm.submitted_at || supabaseForm.created_at,
      reviewedAt: supabaseForm.reviewed_at || null,
      reviewedBy: supabaseForm.reviewed_by || null,
      reviewNotes: supabaseForm.review_notes || null,
    };
  },
};

