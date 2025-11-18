import { membersService } from "./membersService";
import { eventsService } from "./eventsService";
import { articlesService } from "./articlesService";
import { therapyProgramsService } from "./therapyProgramsService";
import { forParentsService } from "./forParentsService";
import { coursesManager } from "../utils/dataManager";

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
   * Search members
   */
  async searchMembers(query) {
    try {
      const { data: members, error } = await membersService.getAll();
      if (error || !members) return [];

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
      const { data: events, error } = await eventsService.getAll();
      if (error || !events) return [];

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
            event.status === "upcoming" ? "/upcoming-events" : "/past-events",
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
      const { data: articles, error } = await articlesService.getAll();
      if (error || !articles) return [];

      const normalizedQuery = this.normalizeQuery(query);
      return articles
        .filter((article) => {
          const searchableFields = [
            article.title_en,
            article.title_ar,
            article.excerpt_en,
            article.excerpt_ar,
            article.category,
            article.category_ar,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableFields.includes(normalizedQuery);
        })
        .map((article) => ({
          type: "article",
          id: article.id,
          title: article.title_en || article.title_ar,
          subtitle: article.category || article.category_ar,
          description: article.excerpt_en || article.excerpt_ar,
          image: article.image_path || article.image_url,
          url: article.url || "/articles",
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
      const courses = coursesManager.getAll();
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
      const { data: programs, error } = await therapyProgramsService.getAll();
      if (error || !programs) return [];

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
      const { data: articles, error } = await forParentsService.getAll();
      if (error || !articles) return [];

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
      // Search all entities in parallel
      const [members, events, articles, courses, therapyPrograms, forParents] =
        await Promise.all([
          this.searchMembers(query),
          this.searchEvents(query),
          this.searchArticles(query),
          this.searchCourses(query),
          this.searchTherapyPrograms(query),
          this.searchForParents(query),
        ]);

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
      };
    }
  },
};
