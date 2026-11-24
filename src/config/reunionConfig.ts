// Fixed Event Details & Custom Configuration for Star Matric Hr Sec School Reunion
export interface VenueInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  address: string;
  googleMapsUrl: string;
  embedMapUrl: string;
  features: string[];
  image: string;
}

export interface DateOptionInfo {
  id: string;
  dateNumber: number;
  month: string;
  year: number;
  fullDateText: string;
  dayOfWeek: string;
  description: string;
  timeSlot: string;
}

export interface MemoryPhoto {
  id: string;
  title: string;
  caption: string;
  description: string;
  url: string;
  year?: string;
  category?: 'group' | 'tour' | 'campus';
  rotation?: number;
}

export const REUNION_CONFIG = {
  eventName: "SCHOOL FRIENDS REUNION 2026",
  schoolName: "Star Matric Hr. Sec. School, Karur",
  schoolShortName: "Star Matric Karur",
  headline: "THE COUNTDOWN TO OUR MEMORIES",
  supportingText: "Years passed, memories stayed. It's time to meet again!",
  primaryCtaText: "REGISTER NOW",
  exploreCtaText: "EXPLORE OUR MEMORIES",
  defaultEventDateText: "27 December 2026",
  eventTimeText: "10:00 AM",
  eventTimezone: "Asia/Kolkata (IST)",
  eventTimestamp: "2026-12-27T10:00:00+05:30", // IST
  
  maxStudentCapacity: 60, // 60-Student Strict Registration Limit

  batchYear: "2024 - 2025",
  batchName: "Star Matric Hr. Sec. School, Karur • Batch 2024 - 2025",
  organizerName: "Reunion Organizing Committee",
  
  // Confirmed Restaurant / Venue
  confirmedVenueName: "Habibi Mandi Karur",
  confirmedVenueDescription: "Confirmed venue for our grand reunion feast & celebrations at Habibi Mandi, Karur",

  // Inquiries / Doubts Helpline Number
  contactPhone: "8838082883",
  contactPhoneDisplay: "+91 88380 82883",
  contactPhoneTel: "tel:+918838082883",

  // Official WhatsApp Group Link & Name
  whatsappGroupName: "Unscripted batch",
  whatsappGroupUrl: "https://chat.whatsapp.com/Hag4n8h0UQ7D8GRVM5j0fR?s=cl&p=a&iam=2",

  // Official Batch Group Photo & Tour Photos
  officialGroupPhotoUrl: "/memories/batch-group-photo-2024-2025.jpg",

  // School Memory Photos (Group Photo, Tour Photos, and Campus Memories)
  defaultMemoryPhotos: [
    {
      id: "mem-group-batch",
      title: "Star Matric Hr. Sec. School — Batch 2024 - 2025",
      caption: "Official Batch Group Photo",
      description: "Our complete Star Matric Hr. Sec. School class with all our classmates and respected teachers.",
      url: "/memories/batch-group-photo-2024-2025.jpg",
      year: "Official Group Photo",
      category: "group",
      rotation: 0
    },
    {
      id: "mem-tour-boys-park",
      title: "Botanical Garden Boys Squad",
      caption: "Smiles at the Botanical Garden • School Tour",
      description: "Boys squad gathered in front of the hillside botanical garden on our unforgettable school tour.",
      url: "/memories/school-tour-boys-park.jpg",
      year: "School Tour",
      category: "tour",
      rotation: 1.5
    },
    {
      id: "mem-tour-girls-garden",
      title: "Garden Arch Girls Batch",
      caption: "Laughter Under the Garden Arch • School Tour",
      description: "Girl classmates posing by the misty garden arch on our pleasant hill station school trip.",
      url: "/memories/school-tour-girls-garden.jpg",
      year: "School Tour",
      category: "tour",
      rotation: -1.8
    },
    {
      id: "mem-tour-boys-night",
      title: "Late Night Tour Shenanigans",
      caption: "Late Night Jokes & Bonding • School Tour",
      description: "Unfiltered smiles, midnight talks, and laughs that made our tour nights so special.",
      url: "/memories/school-tour-boys-night.jpg",
      year: "School Tour",
      category: "tour",
      rotation: 1.2
    },
    {
      id: "mem-tour-girls-misty-hills",
      title: "Misty Mountain Flower Gardens",
      caption: "Hill Station Adventures • School Tour",
      description: "Surrounded by blooming gardens and misty mountain air during our tour sightseeing.",
      url: "/memories/school-tour-girls-misty-hills.jpg",
      year: "School Tour",
      category: "tour",
      rotation: -1.5
    },
    {
      id: "mem-1-benches",
      title: "Where Our Journey Began",
      caption: "Where Our Journey Began",
      description: "Empty classroom with blue benches and blackboard where memories were born.",
      url: "/memories/classroom-empty-benches.jpg",
      year: "Our Classroom",
      category: "campus",
      rotation: -1.5
    },
    {
      id: "mem-2-teaching",
      title: "The Lessons We Shared",
      caption: "The Lessons We Shared",
      description: "Classroom with teacher teaching students and scribbling on the chalkboard.",
      url: "/memories/classroom-teacher-teaching.jpg",
      year: "Classroom Life",
      category: "campus",
      rotation: 1.8
    },
    {
      id: "mem-3-building",
      title: "Our Second Home",
      caption: "Our Second Home",
      description: "School building and playground courtyard under the bright blue sky.",
      url: "/memories/school-building-courtyard.jpg",
      year: "School Campus",
      category: "campus",
      rotation: -1.2
    },
    {
      id: "mem-4-slides",
      title: "The Fun We Never Forgot",
      caption: "The Fun We Never Forgot",
      description: "School playground with colorful slides and joyous school games.",
      url: "/memories/school-playground-slides.jpg",
      year: "Playground",
      category: "campus",
      rotation: 2.0
    },
    {
      id: "mem-5-blackboard",
      title: "Every Lesson, A Memory",
      caption: "Every Lesson, A Memory",
      description: "Teacher writing on the classroom blackboard during chemistry class.",
      url: "/memories/teacher-blackboard-writing.jpg",
      year: "Chalk & Board",
      category: "campus",
      rotation: -2.2
    },
    {
      id: "mem-6-computer-lab",
      title: "Our First Steps into Technology",
      caption: "Our First Steps into Technology",
      description: "School computer laboratory with rows of glowing monitors and learning minds.",
      url: "/memories/school-computer-lab.jpg",
      year: "Computer Lab",
      category: "campus",
      rotation: 1.4
    },
    {
      id: "mem-7-science-lab",
      title: "Learning Beyond the Classroom",
      caption: "Learning Beyond the Classroom",
      description: "Teacher guiding a student during a practical laboratory microscope activity.",
      url: "/memories/teacher-student-science-lab.jpg",
      year: "Science Lab",
      category: "campus",
      rotation: -1.0
    }
  ] as MemoryPhoto[]
};
