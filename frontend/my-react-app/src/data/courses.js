// Courses data - ready for dashboard integration
export const courses = [
  {
    id: 1,
    title: "Fundamentals of Speech and Language Therapy",
    category: "Speech Therapy",
    level: "Beginner",
    duration: "8 weeks",
    lessons: 24,
    students: 156,
    price: "2,500 EGP",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
    instructor: "Dr. Sarah Ahmed",
    instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    description: "Comprehensive course covering speech and language therapy fundamentals for beginners"
  },
  {
    id: 2,
    title: "Autism Spectrum Disorders: Assessment & Intervention",
    category: "Autism",
    level: "Intermediate",
    duration: "10 weeks",
    lessons: 30,
    students: 203,
    price: "3,200 EGP",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80",
    instructor: "Dr. Mohamed Hassan",
    instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    description: "Advanced course in autism spectrum disorder assessment and treatment"   
  },
  {
    id: 3,
    title: "Dysphagia Management",
    category: "Dysphagia",
    level: "Advanced",
    duration: "6 weeks",
    lessons: 18,
    students: 89,
    price: "2,800 EGP",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
    instructor: "Dr. Layla Ibrahim",
    instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    description: "Advanced techniques in dysphagia diagnosis and treatment"
  },
  {
    id: 4,
    title: "Fluency Disorders and Stuttering",
    category: "Fluency Disorders",
    level: "Intermediate",
    duration: "8 weeks",
    lessons: 22,
    students: 134,
    price: "2,700 EGP",
    image: "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?w=600&q=80",
    instructor: "Dr. Ahmed Ali",
    instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    description: "Comprehensive course in fluency disorder assessment and treatment"
  },
  {
    id: 5,
    title: "Child Language Development",
    category: "Language Development",
    level: "Beginner",
    duration: "6 weeks",
    lessons: 20,
    students: 245,
    price: "2,300 EGP",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    instructor: "Dr. Fatima Khaled",
    instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    description: "Study of normal language development stages in children"
  },
  {
    id: 6,
    title: "Voice and Laryngeal Disorders",
    category: "Voice Disorders",
    level: "Advanced",
    duration: "7 weeks",
    lessons: 21,
    students: 98,
    price: "3,000 EGP",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    instructor: "Dr. Karim Nasser",
    instructorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    description: "Diagnosis and treatment of voice and laryngeal disorders"
  },
  {
    id: 7,
    title: "Aphasia: Diagnosis and Rehabilitation",
    category: "Aphasia",
    level: "Intermediate",
    duration: "9 weeks",
    lessons: 27,
    students: 167,
    price: "3,100 EGP",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
    instructor: "Dr. Nour Hassan",
    instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    description: "Comprehensive program in aphasia diagnosis and rehabilitation"
  },
  {
    id: 8,
    title: "Augmentative and Alternative Communication",
    category: "AAC",
    level: "Intermediate",
    duration: "7 weeks",
    lessons: 19,
    students: 112,
    price: "2,900 EGP",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    instructor: "Dr. Maha Fathy",
    instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    description: "Using AAC techniques in therapy"
  },
  {
    id: 9,
    title: "Speech Therapy for Hearing Impaired Children",
    category: "Hearing Impairment",
    level: "Advanced",
    duration: "10 weeks",
    lessons: 28,
    students: 145,
    price: "3,400 EGP",
    image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&q=80",
    instructor: "Dr. Omar Saleh",
    instructorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    description: "Specialized speech therapy techniques for hearing impaired children"
  }
];

// Helper function to get unique categories with proper labels
export const getCategories = () => {
  const categories = [...new Set(courses.map(course => course.category))];
  // Map category values to shorter labels for dropdown
  const labelMap = {
    'Speech Therapy': 'Speech Therapy',
    'Autism': 'Autism',
    'Dysphagia': 'Dysphagia',
    'Fluency Disorders': 'Fluency',
    'Language Development': 'Language Dev',
    'Voice Disorders': 'Voice',
    'Aphasia': 'Aphasia',
    'AAC': 'AAC',
    'Hearing Impairment': 'Hearing'
  };
  
  return categories.map(cat => ({
    value: cat,
    label: labelMap[cat] || cat
  }));
};

// Helper function to get unique levels
export const getLevels = () => {
  return [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ];
};

// Helper function to get featured/popular courses (for CoursesSection)
export const getFeaturedCourses = (limit = 6, coursesList = null) => {
  // Use provided courses list or default to exported courses
  const coursesToUse = coursesList || courses;
  // Sort by students, then take top courses
  return [...coursesToUse]
    .sort((a, b) => {
      return b.students - a.students;
    })
    .slice(0, limit);
};

