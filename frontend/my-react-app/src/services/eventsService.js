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
          // Not found - return null data, no error (same as articlesService)
          return { data: null, error: null };
        }
        console.error('Error fetching event from Supabase:', error);
        return { data: null, error };
      }
      
      // Map to local structure
      const localEvent = this.mapSupabaseToLocal(data);
      return { data: localEvent, error: null };
    } catch (err) {
      console.error('Exception fetching event:', err);
      return { data: null, error: err };
    }
  },

  // Add new event to Supabase
  async add(event) {
    try {
      // First, try to fetch one event to see what columns exist (don't use .single() to avoid error if empty)
      const { data: sampleEvents } = await supabase
        .from('events')
        .select('*')
        .limit(1);
      
      // Build event object - start with basic fields (these should always exist)
      const supabaseEvent = {
        hero_title: event.heroTitle || null,
        hero_description: event.heroDescription || null,
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
      
      // Only add new fields if they exist in the table schema
      if (sampleEvents && sampleEvents.length > 0) {
        const sampleEvent = sampleEvents[0];
        if ('header_info_1' in sampleEvent) {
          supabaseEvent.header_info_1 = event.headerInfo1 || null;
        }
        if ('header_info_2' in sampleEvent) {
          supabaseEvent.header_info_2 = event.headerInfo2 || null;
        }
        if ('overview_description' in sampleEvent) {
          supabaseEvent.overview_description = event.overviewDescription || null;
        }
        if ('duration_text' in sampleEvent) {
          supabaseEvent.duration_text = event.durationText || null;
        }
        if ('tracks_description' in sampleEvent) {
          supabaseEvent.tracks_description = event.tracksDescription || null;
        }
        if ('student_fee' in sampleEvent) {
          supabaseEvent.student_fee = event.studentFee || 300.00;
        }
        if ('booklet_url' in sampleEvent) {
          supabaseEvent.booklet_url = event.bookletUrl || null;
        }
      }
      // If table is empty, just use basic fields

      const { data, error } = await supabase
        .from('events')
        .insert([supabaseEvent])
        .select()
        .single();
      
      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST205' || 
            (error.code === 'PGRST116' && error.message?.includes('schema cache'))) {
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
      // First, try to fetch ANY event to see what columns exist in the table
      const { data: sampleEvents } = await supabase
        .from('events')
        .select('*')
        .limit(1);
      
      // Build update object - start with basic fields (these should always exist)
      const supabaseEvent = {
        hero_title: event.heroTitle || null,
        hero_description: event.heroDescription || null,
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
      
      // Only add new fields if they exist in the table schema
      if (sampleEvents && sampleEvents.length > 0) {
        const sampleEvent = sampleEvents[0];
        if ('header_info_1' in sampleEvent) {
          supabaseEvent.header_info_1 = event.headerInfo1 || null;
        }
        if ('header_info_2' in sampleEvent) {
          supabaseEvent.header_info_2 = event.headerInfo2 || null;
        }
        if ('overview_description' in sampleEvent) {
          supabaseEvent.overview_description = event.overviewDescription || null;
        }
        if ('duration_text' in sampleEvent) {
          supabaseEvent.duration_text = event.durationText || null;
        }
        if ('tracks_description' in sampleEvent) {
          supabaseEvent.tracks_description = event.tracksDescription || null;
        }
        if ('student_fee' in sampleEvent) {
          supabaseEvent.student_fee = event.studentFee || 300.00;
        }
        if ('booklet_url' in sampleEvent) {
          supabaseEvent.booklet_url = event.bookletUrl || null;
        }
      }
      // If table is empty, just use basic fields

      const { data, error } = await supabase
        .from('events')
        .update(supabaseEvent)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // Log the FULL error object to see what Supabase is actually saying
        console.error('❌ FULL Supabase Error Object:', JSON.stringify(error, null, 2));
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error statusCode:', error.statusCode);
        
        // PGRST205 means table doesn't exist
        // PGRST116 with "schema cache" also means table doesn't exist
        if (error.code === 'PGRST205' || 
            (error.code === 'PGRST116' && error.message?.includes('schema cache'))) {
          console.warn('Events table does not exist in Supabase. Event updated locally only.');
          return { data: null, error: { message: 'Table does not exist. Please create the events table first.', code: 'TABLE_NOT_FOUND' } };
        }
        
        // PGRST116 with "0 rows" means event doesn't exist, but table does
        if (error.code === 'PGRST116' && error.details?.includes('0 rows')) {
          console.warn('Event not found in Supabase, but table exists. Update will fail - event may need to be created first.');
        }
        
        // 400 Bad Request or 406 Not Acceptable means table exists but there's a problem
        if (error.status === 400 || error.statusCode === 400 || 
            error.status === 406 || error.statusCode === 406 ||
            error.code === 'PGRST204') {
          console.error('❌ 400/406 Error - Table exists but update failed. This usually means:');
          console.error('   - Column name mismatch');
          console.error('   - Missing required columns');
          console.error('   - Wrong data type');
          console.error('   - RLS policy blocking the update');
          return { data: null, error: { 
            message: `Bad Request: ${error.message || 'Check column names and RLS policies'}`,
            code: 'BAD_REQUEST',
            details: error.details,
            hint: error.hint,
            originalError: error
          }};
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
      heroTitle: supabaseEvent.hero_title || null,
      heroDescription: supabaseEvent.hero_description || null,
      title: supabaseEvent.title,
      subtitle: supabaseEvent.subtitle,
      headerInfo1: supabaseEvent.header_info_1 || null,
      headerInfo2: supabaseEvent.header_info_2 || null,
      overviewDescription: supabaseEvent.overview_description || null,
      durationText: supabaseEvent.duration_text || null,
      tracksDescription: supabaseEvent.tracks_description || null,
      memberFee: supabaseEvent.member_fee,
      guestFee: supabaseEvent.guest_fee,
      studentFee: supabaseEvent.student_fee || 300.00,
      bookletUrl: supabaseEvent.booklet_url || null,
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
      hero_title: localEvent.heroTitle || null,
      hero_description: localEvent.heroDescription || null,
      title: localEvent.title || '',
      subtitle: localEvent.subtitle || '',
      header_info_1: localEvent.headerInfo1 || null,
      header_info_2: localEvent.headerInfo2 || null,
      overview_description: localEvent.overviewDescription || null,
      duration_text: localEvent.durationText || null,
      tracks_description: localEvent.tracksDescription || null,
      member_fee: localEvent.memberFee || 500.00,
      guest_fee: localEvent.guestFee || 800.00,
      student_fee: localEvent.studentFee || 300.00,
      booklet_url: localEvent.bookletUrl || null,
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

