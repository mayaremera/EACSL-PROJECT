import { membersService } from "./membersService";
import { eventsService } from "./eventsService";
import { articlesService } from "./articlesService";
import { therapyProgramsService } from "./therapyProgramsService";
import { forParentsService } from "./forParentsService";
import { 
  coursesManager, 
  membersManager, 
  eventsManager, 
  articlesManager, 
  therapyProgramsManager, 
  forParentsManager 
} from "../utils/dataManager";

/**
 * Smart search service that searches across all entities in the website
 */
export const searchService = {
  /**
   * Normalize search query - remove extra spaces, lowercase
   */
  normalizeQuery(query) {
    return query.trim().toLowerCase();
  },

  /**
   * Check if text matches search query
   */
  matchesQuery(text, query) {
    if (!text || !query) return false;
    const normalizedText = String(text).toLowerCase();
    const normalizedQuery = this.normalizeQuery(query);
    return normalizedText.includes(normalizedQuery);
  },

  /**
   * Add timeout to a promise to prevent hanging
   */
  async withTimeout(promise, timeoutMs = 5000) {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    );
    return Promise.race([promise, timeoutPromise]);
  },

  /**
   * Search members
   */
  async searchMembers(query) {
    try {
      // Use cached data first for fast search, then sync in background
      let members = membersManager._getAllFromLocalStorage();
      
      // Try to sync from Supabase in background (don't wait for it)
      membersManager.getAll({ forceRefresh: true }).catch(() => {
        // Silently fail background sync
      });
      
      if (!members || members.length === 0) return [];

      const normalizedQuery = this.normalizeQuery(query);
      return members
        .filter((member) => {
          const searchableFields = [
            member.name,
            member.email,
            member.role,
            member.description,
            member.full_description,
            member.nationality,
            member.location,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableFields.includes(normalizedQuery);
        })
        .map((member) => ({
          type: "member",
          id: member.id,
          title: member.name,
          subtitle: member.role || member.email,
          description: member.description || member.full_description,
          image: member.image,
          url: `/member-profile/${member.id}`,
        }))
        .slice(0, 5); // Limit to 5 results
    } catch (error) {
      console.error("Error searching members:", error);
      return [];
    }
  },

  /**
   * Search events
   */
  async searchEvents(query) {
    try {
      // Use cached data first for fast search
      const cached = eventsManager._getAllFromLocalStorage();
      const events = [...(cached.upcoming || []), ...(cached.past || [])];
      
      // Try to sync from Supabase in background (don't wait for it)
      eventsManager.getAll({ forceRefresh: true }).catch(() => {
        // Silently fail background sync
      });
      
      if (!events || events.length === 0) return [];

      const normalizedQuery = this.normalizeQuery(query);
      return events
        .filter((event) => {
          const searchableFields = [
            event.title,
            event.subtitle,
            event.day1_title,
            event.day2_title,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableFields.includes(normalizedQuery);
        })
        .map((event) => ({
          type: "event",
          id: event.id,
          title: event.title,
          subtitle:
            event.subtitle ||
            (event.status === "upcoming" ? "Upcoming Event" : "Past Event"),
          description: event.subtitle,
          image: event.hero_image_path || event.hero_image_url,
          url:
            event.status === "upcoming" 
              ? `/upcoming-events/${event.id}` 
              : "/past-events",
        }))
        .slice(0, 5);
    } catch (error) {
      console.error("Error searching events:", error);
      return [];
    }
  },

  /**
   * Search articles
   */
  async searchArticles(query) {
    try {
      // Use cached data first for fast search
      let articles = articlesManager._getAllFromLocalStorage();
      
      // Try to sync from Supabase in background (don't wait for it)
      articlesManager.getAll({ forceRefresh: true }).catch(() => {
        // Silently fail background sync
      });
      
      if (!articles || articles.length === 0) return [];

      const normalizedQuery = this.normalizeQuery(query);
      return articles
        .filter((article) => {
          // Handle both camelCase (local format) and snake_case (Supabase format) field names
          const searchableFields = [
            article.titleEn || article.title_en,
            article.titleAr || article.title_ar,
            article.excerptEn || article.excerpt_en,
            article.excerptAr || article.excerpt_ar,
            article.category,
            article.categoryAr || article.category_ar,
            article.url,
          ]
            .filter(Boolean)
            .map(field => String(field).toLowerCase());

          // Check if query matches any of the searchable fields
          return searchableFields.some(field => field.includes(normalizedQuery));
        })
        .map((article) => ({
          type: "article",
          id: article.id,
          title: article.titleEn || article.title_en || article.titleAr || article.title_ar,
          subtitle: article.category || article.categoryAr || article.category_ar,
          description: article.excerptEn || article.excerpt_en || article.excerptAr || article.excerpt_ar,
          image: article.image || article.imagePath || article.imageUrl || article.image_path || article.image_url,
          url: "/articles",
        }))
        .slice(0, 5);
    } catch (error) {
      console.error("Error searching articles:", error);
      return [];
    }
  },

  /**
   * Search courses
   */
  async searchCourses(query) {
    try {
      // Use cached data first for fast search
      let courses = coursesManager._getAllFromLocalStorage();
      
      // Try to sync from Supabase in background (don't wait for it)
      coursesManager.getAll().then(() => {
        // Cache will be updated by coursesManager
      }).catch(() => {
        // Silently fail background sync
      });
      
      if (!courses || courses.length === 0) return [];

      const normalizedQuery = this.normalizeQuery(query);
      return courses
        .filter((course) => {
          const searchableFields = [
            course.title,
            course.titleEn,
            course.titleAr,
            course.description,
            course.descriptionShort,
            course.category,
            course.categoryAr,
            course.instructor,
            course.level,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableFields.includes(normalizedQuery);
        })
        .map((course) => ({
          type: "course",
          id: course.id,
          title: course.title || course.titleEn || course.titleAr,
          subtitle: course.category || course.instructor,
          description: course.description || course.descriptionShort,
          image: course.image,
          url: `/course-details/${course.id}`,
        }))
        .slice(0, 5);
    } catch (error) {
      console.error("Error searching courses:", error);
      return [];
    }
  },

  /**
   * Search therapy programs
   */
  async searchTherapyPrograms(query) {
    try {
      // Use cached data first for fast search
      let programs = therapyProgramsManager._getAllFromLocalStorage();
      
      // Try to sync from Supabase in background (don't wait for it)
      therapyProgramsManager.getAll({ forceRefresh: true }).catch(() => {
        // Silently fail background sync
      });
      
      if (!programs || programs.length === 0) return [];

      const normalizedQuery = this.normalizeQuery(query);
      return programs
        .filter((program) => {
          const searchableFields = [
            program.title,
            program.title_ar,
            program.description,
            program.description_ar,
            program.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableFields.includes(normalizedQuery);
        })
        .map((program) => ({
          type: "therapy-program",
          id: program.id,
          title: program.title || program.title_ar,
          subtitle: program.category || "Therapy Program",
          description: program.description || program.description_ar,
          image: program.image_path || program.image_url,
          url: "/therapy-programs",
        }))
        .slice(0, 5);
    } catch (error) {
      console.error("Error searching therapy programs:", error);
      return [];
    }
  },

  /**
   * Search for parents articles
   */
  async searchForParents(query) {
    try {
      // Use cached data first for fast search
      let articles = forParentsManager._getAllFromLocalStorage();
      
      // Try to sync from Supabase in background (don't wait for it)
      forParentsManager.getAll({ forceRefresh: true }).catch(() => {
        // Silently fail background sync
      });
      
      if (!articles || articles.length === 0) return [];

      const normalizedQuery = this.normalizeQuery(query);
      return articles
        .filter((article) => {
          const searchableFields = [
            article.title,
            article.title_ar,
            article.description,
            article.description_ar,
            article.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableFields.includes(normalizedQuery);
        })
        .map((article) => ({
          type: "for-parents",
          id: article.id,
          title: article.title || article.title_ar,
          subtitle: article.category || "For Parents",
          description: article.description || article.description_ar,
          image: article.image_path || article.image_url,
          url: "/for-parents",
        }))
        .slice(0, 5);
    } catch (error) {
      console.error("Error searching for parents:", error);
      return [];
    }
  },

  /**
   * Perform comprehensive search across all entities
   */
  async searchAll(query) {
    if (!query || query.trim().length < 2) {
      return {
        members: [],
        events: [],
        articles: [],
        courses: [],
        therapyPrograms: [],
        forParents: [],
        total: 0,
      };
    }

    try {
      // Search all entities in parallel with individual error handling
      // Use Promise.allSettled to prevent one failure from breaking all searches
      const results = await Promise.allSettled([
        this.searchMembers(query).catch(err => {
          console.error("Error searching members:", err);
          return [];
        }),
        this.searchEvents(query).catch(err => {
          console.error("Error searching events:", err);
          return [];
        }),
        this.searchArticles(query).catch(err => {
          console.error("Error searching articles:", err);
          return [];
        }),
        this.searchCourses(query).catch(err => {
          console.error("Error searching courses:", err);
          return [];
        }),
        this.searchTherapyPrograms(query).catch(err => {
          console.error("Error searching therapy programs:", err);
          return [];
        }),
        this.searchForParents(query).catch(err => {
          console.error("Error searching for parents:", err);
          return [];
        }),
      ]);

      // Extract results from Promise.allSettled
      const members = results[0].status === 'fulfilled' ? results[0].value : [];
      const events = results[1].status === 'fulfilled' ? results[1].value : [];
      const articles = results[2].status === 'fulfilled' ? results[2].value : [];
      const courses = results[3].status === 'fulfilled' ? results[3].value : [];
      const therapyPrograms = results[4].status === 'fulfilled' ? results[4].value : [];
      const forParents = results[5].status === 'fulfilled' ? results[5].value : [];

      const total =
        members.length +
        events.length +
        articles.length +
        courses.length +
        therapyPrograms.length +
        forParents.length;

      return {
        members,
        events,
        articles,
        courses,
        therapyPrograms,
        forParents,
        total,
      };
    } catch (error) {
      console.error("Error performing search:", error);
      return {
        members: [],
        events: [],
        articles: [],
        courses: [],
        therapyPrograms: [],
        forParents: [],
        total: 0,
        error: error.message || 'Search failed. Please try again.',
      };
    }
  },
};
