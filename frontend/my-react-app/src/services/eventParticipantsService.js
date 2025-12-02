import { supabase } from '../lib/supabase';

// Supabase Event Participants Service
export const eventParticipantsService = {
  // Get all participants for an event
  async getByEventId(eventId) {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (error) {
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') || 
            error.message?.includes('schema cache')) {
          console.warn('Event participants table does not exist in Supabase. Please run CREATE_EVENT_PARTICIPANTS_TABLE.sql');
          return { data: [], error: { message: 'Table does not exist. Please create the event_participants table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error fetching event participants from Supabase:', error);
        return { data: null, error };
      }
      
      // Group by role
      const grouped = {
        speakers: [],
        scientific_committee: [],
        organizing_committee: []
      };
      
      (data || []).forEach(participant => {
        const localParticipant = this.mapSupabaseToLocal(participant);
        if (participant.role === 'speaker') {
          grouped.speakers.push(localParticipant);
        } else if (participant.role === 'scientific_committee') {
          grouped.scientific_committee.push(localParticipant);
        } else if (participant.role === 'organizing_committee') {
          grouped.organizing_committee.push(localParticipant);
        }
      });
      
      return { data: grouped, error: null };
    } catch (err) {
      console.error('Exception fetching event participants:', err);
      return { data: null, error: err };
    }
  },

  // Get participants by role for an event
  async getByEventIdAndRole(eventId, role) {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('role', role)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (error) {
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') || 
            error.message?.includes('schema cache')) {
          return { data: [], error: { message: 'Table does not exist. Please create the event_participants table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error fetching event participants from Supabase:', error);
        return { data: null, error };
      }
      
      return { data: (data || []).map(p => this.mapSupabaseToLocal(p)), error: null };
    } catch (err) {
      console.error('Exception fetching event participants:', err);
      return { data: null, error: err };
    }
  },

  // Add new participant
  async add(participant) {
    try {
      const supabaseParticipant = {
        event_id: participant.eventId,
        name: participant.name || '',
        image_url: participant.imageUrl || null,
        image_path: participant.imagePath || null,
        bio: participant.bio || null,
        linkedin_url: participant.linkedinUrl || null,
        role: participant.role || 'speaker',
        display_order: participant.displayOrder || 0
      };

      const { data, error } = await supabase
        .from('event_participants')
        .insert([supabaseParticipant])
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST205' || 
            (error.code === 'PGRST116' && error.message?.includes('schema cache'))) {
          console.warn('Event participants table does not exist in Supabase.');
          return { data: null, error: { message: 'Table does not exist. Please create the event_participants table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error adding event participant to Supabase:', error);
        return { data: null, error };
      }
      
      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error('Exception adding event participant:', err);
      return { data: null, error: err };
    }
  },

  // Update participant
  async update(id, participant) {
    try {
      const supabaseParticipant = {
        name: participant.name || '',
        image_url: participant.imageUrl || null,
        image_path: participant.imagePath || null,
        bio: participant.bio || null,
        linkedin_url: participant.linkedinUrl || null,
        role: participant.role || 'speaker',
        display_order: participant.displayOrder || 0
      };

      const { data, error } = await supabase
        .from('event_participants')
        .update(supabaseParticipant)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST205' || 
            (error.code === 'PGRST116' && error.message?.includes('schema cache'))) {
          console.warn('Event participants table does not exist in Supabase.');
          return { data: null, error: { message: 'Table does not exist. Please create the event_participants table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error updating event participant in Supabase:', error);
        return { data: null, error };
      }
      
      return { data: this.mapSupabaseToLocal(data), error: null };
    } catch (err) {
      console.error('Exception updating event participant:', err);
      return { data: null, error: err };
    }
  },

  // Delete participant
  async delete(id) {
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('id', id);
      
      if (error) {
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') || 
            error.message?.includes('schema cache')) {
          console.warn('Event participants table does not exist in Supabase.');
          return { error: { message: 'Table does not exist. Please create the event_participants table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error deleting event participant from Supabase:', error);
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Exception deleting event participant:', err);
      return { error: err };
    }
  },

  // Upload image to EventBucket
  async uploadImage(file, fileName) {
    try {
      const fileExt = fileName.split('.').pop();
      const filePath = `participants/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('EventBucket')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading participant image to EventBucket:', error);
        return { data: null, error };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('EventBucket')
        .getPublicUrl(filePath);

      return { 
        data: { 
          path: filePath, 
          url: urlData.publicUrl 
        }, 
        error: null 
      };
    } catch (err) {
      console.error('Exception uploading participant image:', err);
      return { data: null, error: err };
    }
  },

  // Delete image from EventBucket
  async deleteImage(filePath) {
    try {
      const { error } = await supabase.storage
        .from('EventBucket')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting participant image from EventBucket:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Exception deleting participant image:', err);
      return { error: err };
    }
  },

  // Map Supabase participant structure to local structure
  mapSupabaseToLocal(supabaseParticipant) {
    return {
      id: supabaseParticipant.id,
      eventId: supabaseParticipant.event_id,
      name: supabaseParticipant.name,
      imageUrl: supabaseParticipant.image_url,
      imagePath: supabaseParticipant.image_path,
      bio: supabaseParticipant.bio,
      linkedinUrl: supabaseParticipant.linkedin_url,
      role: supabaseParticipant.role,
      displayOrder: supabaseParticipant.display_order || 0,
      createdAt: supabaseParticipant.created_at,
      updatedAt: supabaseParticipant.updated_at,
    };
  },

  // Map local participant structure to Supabase structure
  mapLocalToSupabase(localParticipant) {
    return {
      event_id: localParticipant.eventId,
      name: localParticipant.name || '',
      image_url: localParticipant.imageUrl || null,
      image_path: localParticipant.imagePath || null,
      bio: localParticipant.bio || null,
      linkedin_url: localParticipant.linkedinUrl || null,
      role: localParticipant.role || 'speaker',
      display_order: localParticipant.displayOrder || 0,
    };
  },
};

