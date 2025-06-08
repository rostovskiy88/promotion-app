import { addArticle } from '../services/articleService';

const sampleArticles = [
  {
    title: "7 Skills of Highly Effective Programmers",
    content: "Our team was inspired by the seven skills of highly effective programmers created by the TechLead. We wanted to provide our own take on the topic...",
    category: "Productivity",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Oleg Rostovskyi",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "SMM starter pack, part 2: content promotion",
    content: "This is the second part of the SMM starter pack series of articles. If you made it this far, you must be willing to learn about promoting business through social media.",
    category: "Media",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Patricia Kemp",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "11 Things I Wish I Knew When I Started My Business",
    content: "Here are 11 things I wish I knew when I started my business. I hope they will save you some time and some anguish because (experience is a good teacher here)...",
    category: "Business",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Lisa Barnes",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "Mastering Time Management for Developers",
    content: "Time management is crucial for developers who juggle multiple projects and deadlines. Here are proven strategies to boost your productivity and maintain work-life balance.",
    category: "Productivity",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Glen Williams",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "Building Your Personal Brand on Social Media",
    content: "In today's digital world, having a strong personal brand on social media is essential for career growth. Learn how to create authentic content that resonates with your audience.",
    category: "Media",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Sarah Johnson",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "Startup Funding: A Complete Guide",
    content: "Raising funds for your startup can be challenging. This comprehensive guide covers everything from seed funding to Series A and beyond, with real-world examples and tips.",
    category: "Business",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Mike Chen",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "The Future of Remote Work",
    content: "Remote work has transformed the modern workplace. Explore the trends, challenges, and opportunities that lie ahead for distributed teams and digital nomads.",
    category: "Business",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Emma Davis",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "CSS Grid vs Flexbox: When to Use Which",
    content: "Understanding the differences between CSS Grid and Flexbox is crucial for modern web development. Learn when to use each layout method for optimal results.",
    category: "Productivity",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Alex Thompson",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "Content Marketing Strategies That Actually Work",
    content: "Cut through the noise with content marketing strategies that deliver real results. From storytelling to SEO optimization, master the art of engaging your audience.",
    category: "Media",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Rachel Green",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "Scaling Your Startup: Lessons from Silicon Valley",
    content: "Learn from successful Silicon Valley entrepreneurs about the key strategies for scaling your startup from 10 to 10,000 employees while maintaining culture and quality.",
    category: "Business",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "David Kim",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "JavaScript Performance Optimization Tips",
    content: "Boost your JavaScript application performance with these proven optimization techniques. From memory management to async patterns, improve your code efficiency.",
    category: "Productivity",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Sofia Rodriguez",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "Instagram Marketing for Small Businesses",
    content: "Transform your small business with Instagram marketing. Discover how to create engaging content, use hashtags effectively, and convert followers into customers.",
    category: "Media",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Maria Santos",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "The Art of Code Reviews",
    content: "Effective code reviews are essential for maintaining code quality and team collaboration. Learn best practices for giving and receiving constructive feedback.",
    category: "Productivity",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "James Wilson",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "E-commerce Trends Shaping 2024",
    content: "Stay ahead of the curve with the latest e-commerce trends. From AI-powered personalization to sustainable shopping, discover what's driving online retail.",
    category: "Business",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Anna Lee",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "YouTube Algorithm Mastery",
    content: "Crack the YouTube algorithm and grow your channel organically. Learn the secrets of successful YouTubers and optimize your content for maximum reach.",
    category: "Media",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Kevin Zhang",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "React Hooks Deep Dive",
    content: "Master React Hooks with this comprehensive guide. From useState to custom hooks, learn how to write cleaner, more efficient React components.",
    category: "Productivity",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Tom Anderson",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "Building a Million Dollar SaaS",
    content: "From idea to IPO - learn the journey of building a successful SaaS business. Real strategies from founders who've scaled to millions in recurring revenue.",
    category: "Business",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Lisa Park",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "TikTok Marketing Strategy Guide",
    content: "Harness the power of TikTok for your brand. Learn how to create viral content, engage with Gen Z audiences, and drive real business results on the platform.",
    category: "Media",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Zoe Miller",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  }
];

export async function addSampleArticles() {
  console.log('Adding sample articles to database...');
  
  try {
    for (const article of sampleArticles) {
      await addArticle(article);
      console.log(`Added article: ${article.title}`);
    }
    console.log('All sample articles added successfully!');
  } catch (error) {
    console.error('Error adding sample articles:', error);
  }
}

// Export individual articles if needed
export { sampleArticles }; 