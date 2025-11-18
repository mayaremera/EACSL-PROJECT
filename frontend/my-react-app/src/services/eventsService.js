import { supabase } from '../lib/supabase';

// Supabase Events Service
export const eventsService = {
  // Get all events from Supabase
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Events table does not exist in Supabase. Please run the SQL script from EVENTS_SUPABASE_SETUP.md');
          return { data: [], error: { message: 'Table does not exist. Please create the events table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error fetching events from Supabase:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception fetching events:', err);
      return { data: null, error: err };
    }
  },

  // Get upcoming events
  async getUpcoming() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          return { data: [], error: { message: 'Table does not exist. Please create the events table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error fetching upcoming events from Supabase:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception fetching upcoming events:', err);
      return { data: null, error: err };
    }
  },

  // Get past events
  async getPast() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'past')
        .order('event_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          return { data: [], error: { message: 'Table does not exist. Please create the events table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error fetching past events from Supabase:', error);
        return { data: null, error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception fetching past events:', err);
      return { data: null, error: err };
    }
  },

  // Get event by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - return null data, no error
          return { data: null, error: null };
        }
        console.error('Error fetching event from Supabase:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Exception fetching event:', err);
      return { data: null, error: err };
    }
  },

  // Add new event to Supabase
  async add(event) {
    try {
      // Map local event structure to Supabase structure
      const supabaseEvent = {
        title: event.title || '',
        subtitle: event.subtitle || '',
        member_fee: event.memberFee || 500.00,
        guest_fee: event.guestFee || 800.00,
        tracks: event.tracks || [],
        schedule_day1: event.scheduleDay1 || [],
        schedule_day2: event.scheduleDay2 || [],
        day1_title: event.day1Title || 'Day One - Knowledge and Innovation',
        day2_title: event.day2Title || 'Day Two - Collaboration and Future Directions',
        hero_image_url: event.heroImageUrl || null,
        hero_image_path: event.heroImagePath || null,
        status: event.status || 'upcoming',
        event_date: event.eventDate || null,
      };

      const { data, error } = await supabase
        .from('events')
        .insert([supabaseEvent])
        .select()
        .single();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Events table does not exist in Supabase. Event saved locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the events table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error adding event to Supabase:', error);
        return { data: null, error };
      }
      
      // Map back to local structure
      const localEvent = this.mapSupabaseToLocal(data);
      return { data: localEvent, error: null };
    } catch (err) {
      console.error('Exception adding event:', err);
      return { data: null, error: err };
    }
  },

  // Update event in Supabase
  async update(id, event) {
    try {
      // Map local event structure to Supabase structure
      const supabaseEvent = {
        title: event.title || '',
        subtitle: event.subtitle || '',
        member_fee: event.memberFee || 500.00,
        guest_fee: event.guestFee || 800.00,
        tracks: event.tracks || [],
        schedule_day1: event.scheduleDay1 || [],
        schedule_day2: event.scheduleDay2 || [],
        day1_title: event.day1Title || 'Day One - Knowledge and Innovation',
        day2_title: event.day2Title || 'Day Two - Collaboration and Future Directions',
        hero_image_url: event.heroImageUrl || null,
        hero_image_path: event.heroImagePath || null,
        status: event.status || 'upcoming',
        event_date: event.eventDate || null,
      };

      const { data, error } = await supabase
        .from('events')
        .update(supabaseEvent)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Events table does not exist in Supabase. Event updated locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the events table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error updating event in Supabase:', error);
        return { data: null, error };
      }
      
      // Map back to local structure
      const localEvent = this.mapSupabaseToLocal(data);
      return { data: localEvent, error: null };
    } catch (err) {
      console.error('Exception updating event:', err);
      return { data: null, error: err };
    }
  },

  // Delete event from Supabase
  async delete(id) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || 
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache')) {
          console.warn('Events table does not exist in Supabase. Event deleted locally only.');
          return { error: { message: 'Table does not exist. Please create the events table first.', code: 'TABLE_NOT_FOUND' } };
        }
        console.error('Error deleting event from Supabase:', error);
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Exception deleting event:', err);
      return { error: err };
    }
  },

  // Upload image to EventBucket
  async uploadImage(file, fileName) {
    try {
      const fileExt = fileName.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('EventBucket')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image to EventBucket:', error);
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
      console.error('Exception uploading image:', err);
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
        console.error('Error deleting image from EventBucket:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Exception deleting image:', err);
      return { error: err };
    }
  },

  // Map Supabase event structure to local structure
  mapSupabaseToLocal(supabaseEvent) {
    return {
      id: supabaseEvent.id,
      title: supabaseEvent.title,
      subtitle: supabaseEvent.subtitle,
      memberFee: supabaseEvent.member_fee,
      guestFee: supabaseEvent.guest_fee,
      tracks: supabaseEvent.tracks || [],
      scheduleDay1: supabaseEvent.schedule_day1 || [],
      scheduleDay2: supabaseEvent.schedule_day2 || [],
      day1Title: supabaseEvent.day1_title,
      day2Title: supabaseEvent.day2_title,
      heroImageUrl: supabaseEvent.hero_image_url,
      heroImagePath: supabaseEvent.hero_image_path,
      status: supabaseEvent.status || 'upcoming',
      eventDate: supabaseEvent.event_date,
      createdAt: supabaseEvent.created_at,
      updatedAt: supabaseEvent.updated_at,
    };
  },

  // Map local event structure to Supabase structure
  mapLocalToSupabase(localEvent) {
    return {
      title: localEvent.title || '',
      subtitle: localEvent.subtitle || '',
      member_fee: localEvent.memberFee || 500.00,
      guest_fee: localEvent.guestFee || 800.00,
      tracks: localEvent.tracks || [],
      schedule_day1: localEvent.scheduleDay1 || [],
      schedule_day2: localEvent.scheduleDay2 || [],
      day1_title: localEvent.day1Title || 'Day One - Knowledge and Innovation',
      day2_title: localEvent.day2Title || 'Day Two - Collaboration and Future Directions',
      hero_image_url: localEvent.heroImageUrl || null,
      hero_image_path: localEvent.heroImagePath || null,
      status: localEvent.status || 'upcoming',
      event_date: localEvent.eventDate || null,
    };
  },
};

