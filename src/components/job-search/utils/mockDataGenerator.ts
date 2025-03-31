import { SearchResult, SearchProvider } from "../types";
import { formatBooleanForProvider } from "./queryHelpers";

// Common skills by category for more realistic data
const skillsByCategory = {
  webDevelopment: [
    "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Express", 
    "HTML", "CSS", "Tailwind", "Bootstrap", "Webpack", "Vite", "Redux"
  ],
  mobileDevelopment: [
    "React Native", "Flutter", "Swift", "Kotlin", "Android", "iOS", "Xamarin", "Objective-C"
  ],
  dataScience: [
    "Python", "R", "TensorFlow", "PyTorch", "scikit-learn", "pandas", "NumPy", 
    "Data Analysis", "Machine Learning", "AI", "NLP", "Computer Vision"
  ],
  devOps: [
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Jenkins", "Terraform",
    "Ansible", "Linux", "Git", "GitHub Actions", "GitLab CI"
  ],
  backend: [
    "Java", "C#", ".NET", "Spring Boot", "Django", "Flask", "PHP", "Laravel", 
    "Ruby", "Rails", "Go", "Rust", "SQL", "NoSQL", "MongoDB", "PostgreSQL"
  ]
};

// Common companies by skill category
const companiesByCategory = {
  webDevelopment: ["Facebook", "Google", "Netflix", "Airbnb", "Vercel", "Netlify", "Shopify"],
  mobileDevelopment: ["Apple", "Google", "Uber", "Lyft", "Spotify", "TikTok"],
  dataScience: ["OpenAI", "DeepMind", "Anthropic", "Databricks", "Tesla", "Palantir"],
  devOps: ["Amazon", "Microsoft", "HashiCorp", "GitLab", "GitHub", "DigitalOcean"],
  backend: ["Oracle", "SAP", "IBM", "Salesforce", "Twilio", "Stripe"]
};

// Locations by region
const locations = [
  "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", 
  "Boston, MA", "London, UK", "Berlin, Germany", "Toronto, Canada",
  "Sydney, Australia", "Singapore", "Tokyo, Japan", "Remote"
];

// Experience levels
const experienceLevels = ["entry", "mid", "senior", "lead", "principal"];

// Generate a random item from an array
const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate a random subset of items from an array
const randomSubset = <T>(array: T[], min: number, max: number): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return [...array]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
};

// Generate a random number within a range
const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a profile image URL
const generateProfileImage = (index: number, source: string): string => {
  return `https://randomuser.me/api/portraits/${
    Math.random() > 0.7 ? "women" : "men"
  }/${(index % 70) + 1}.jpg`;
};

// Check if search term matches skills - simplified for better matching
const matchesSkills = (skills: string[], searchTerm: string): boolean => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  if (lowerSearchTerm.length < 3) return true;
  
  return skills.some(skill => skill.toLowerCase().includes(lowerSearchTerm));
};

// Check if search query matches a profile - simplified for better matching
const matchesProfile = (profile: SearchResult, formattedQuery: string): boolean => {
  if (!formattedQuery || formattedQuery.length < 3) return true;
  
  const lowerQuery = formattedQuery.toLowerCase();
  const skills = profile.skills || [];
  
  if (lowerQuery.includes(" or ")) {
    const orTerms = lowerQuery.split(" or ").map(t => t.trim());
    return orTerms.some(term => 
      matchesSkills(skills, term) || 
      profile.title.toLowerCase().includes(term) ||
      (profile.company?.toLowerCase().includes(term) || false) ||
      term.length < 4
    );
  }
  
  if (lowerQuery.includes(" and ")) {
    const andTerms = lowerQuery.split(" and ").map(t => t.trim());
    return andTerms.some(term => 
      matchesSkills(skills, term) || 
      profile.title.toLowerCase().includes(term) ||
      (profile.company?.toLowerCase().includes(term) || false) ||
      term.length < 4
    );
  }
  
  return matchesSkills(skills, lowerQuery) || 
    profile.title.toLowerCase().includes(lowerQuery) ||
    (profile.company?.toLowerCase().includes(lowerQuery) || false) ||
    Math.random() > 0.7;
};

// Generate a mock candidate profile based on source
const generateMockProfile = (index: number, source: string): SearchResult => {
  const categories = Object.keys(skillsByCategory);
  const category = randomItem(categories) as keyof typeof skillsByCategory;
  
  const skills = randomSubset(
    skillsByCategory[category],
    2,
    5
  );
  
  const firstName = randomItem([
    "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", 
    "Quinn", "Jamie", "Drew", "Cameron", "Skyler", "Reese", "Finley"
  ]);
  
  const lastName = randomItem([
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", 
    "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas"
  ]);
  
  const fullName = `${firstName} ${lastName}`;
  
  const experienceLevel = randomItem(experienceLevels);
  const primarySkill = randomItem(skills);
  const jobTitle = experienceLevel === "entry" 
    ? `Junior ${primarySkill} Developer`
    : experienceLevel === "senior" || experienceLevel === "lead" || experienceLevel === "principal"
      ? `Senior ${primarySkill} Engineer`
      : `${primarySkill} Developer`;
  
  const company = randomItem(companiesByCategory[category]);
  
  const location = randomItem(locations);
  
  const profile: SearchResult = {
    id: `mock-${source}-${index}`,
    title: source === "github" ? fullName : jobTitle,
    name: source !== "github" ? fullName : undefined,
    company: source === "github" 
      ? Math.random() > 0.3 ? company : undefined 
      : company,
    location: Math.random() > 0.2 ? location : undefined,
    url: `https://${source}.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    source: source,
    skills: skills,
    experienceLevel: experienceLevel,
    profileImage: source !== "github" ? generateProfileImage(index, source) : undefined,
    avatar_url: source === "github" ? generateProfileImage(index, source) : undefined,
    lastActive: `${randomNumber(1, 30)} days ago`,
    connections: randomNumber(50, 1000),
    profileCompleteness: randomNumber(70, 100),
    snippet: `Experienced ${primarySkill} developer with ${randomNumber(1, 10)} years of experience in ${randomItem(skills)} and ${randomItem(skills)}.`
  };
  
  return profile;
};

// Create a pool of mock profiles for each source
const createMockProfilePool = (source: string, count: number): SearchResult[] => {
  return Array.from({ length: count }, (_, i) => generateMockProfile(i, source));
};

// Create mock profile pools
const mockProfiles: Record<string, SearchResult[]> = {
  github: createMockProfilePool("github", 50),
  linkedin: createMockProfilePool("linkedin", 50),
  twitter: createMockProfilePool("twitter", 30),
  stackoverflow: createMockProfilePool("stackoverflow", 40),
  indeed: createMockProfilePool("indeed", 50),
  google: createMockProfilePool("google", 50),
  wellfound: createMockProfilePool("wellfound", 30)
};

/**
 * Search for mock profiles based on a query
 */
export const searchMockProfiles = (
  query: string,
  provider: SearchProvider,
  selectedBoards: string[],
  page: number = 1,
  pageSize: number = 10
): { 
  results: SearchResult[],
  resultsBySource: Record<string, SearchResult[]>
} => {
  const formattedQuery = formatBooleanForProvider(query, provider);
  const resultsBySource: Record<string, SearchResult[]> = {};
  let allResults: SearchResult[] = [];
  
  console.log('Mock search:', { query, provider, selectedBoards, page });
  
  if (selectedBoards.length === 0) {
    selectedBoards = [provider];
    console.log('No boards selected, using provider as fallback:', provider);
  }
  
  selectedBoards.forEach(board => {
    if (mockProfiles[board]) {
      let matchingProfiles = mockProfiles[board].filter(profile => 
        matchesProfile(profile, formattedQuery)
      );
      
      if (matchingProfiles.length === 0) {
        console.log('No matches found for', board, '- returning sample data');
        matchingProfiles = mockProfiles[board].slice(0, 5);
      }
      
      if (matchingProfiles.length > 0) {
        resultsBySource[board] = matchingProfiles;
        allResults = [...allResults, ...matchingProfiles];
      }
    }
  });
  
  if (allResults.length === 0) {
    console.log('No results found in mock search, returning default profiles');
    const defaultBoard = selectedBoards[0] || 'github';
    const defaultProfiles = mockProfiles[defaultBoard].slice(0, 5);
    resultsBySource[defaultBoard] = defaultProfiles;
    allResults = defaultProfiles;
  }
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedResults = allResults.slice(startIndex, endIndex);
  
  const paginatedResultsBySource: Record<string, SearchResult[]> = {};
  Object.keys(resultsBySource).forEach(source => {
    paginatedResultsBySource[source] = resultsBySource[source].slice(0, pageSize);
  });
  
  console.log(`Mock search found ${allResults.length} profiles for query "${query}"`);
  
  return {
    results: paginatedResults,
    resultsBySource: paginatedResultsBySource
  };
};

// Utility to determine if a random proportion of results should match the query
export const shouldUseRandomResultsForQuery = (query: string): boolean => {
  const simpleQuery = query.length < 10 && !query.includes(" AND ") && !query.includes(" OR ");
  if (simpleQuery) {
    return Math.random() > 0.3;
  }
  return Math.random() > 0.7;
};

// Toggle for mock mode - use localStorage to persist the setting
export let mockModeEnabled = false;

// Initialize mockModeEnabled from localStorage when the module loads
try {
  const storedMockMode = localStorage.getItem('mockModeEnabled');
  mockModeEnabled = storedMockMode === 'true';
  console.log(`Initialized mock mode from localStorage: ${mockModeEnabled}`);
} catch (e) {
  console.error('Error accessing localStorage:', e);
}

// Function to toggle mock mode
export const toggleMockMode = (enabled: boolean): void => {
  mockModeEnabled = enabled;
  try {
    localStorage.setItem('mockModeEnabled', String(enabled));
  } catch (e) {
    console.error('Error saving mock mode to localStorage:', e);
  }
  console.log(`Mock mode ${enabled ? 'enabled' : 'disabled'}`);
};

// Function to check if mock mode is enabled
export const isMockModeEnabled = (): boolean => {
  return mockModeEnabled;
};
