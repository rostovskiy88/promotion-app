import { addArticle } from '../services/articleService';

const sampleArticles = [
  {
    title: "7 Skills of Highly Effective Programmers",
    content: "Our team was inspired by the seven skills of highly effective programmers created by the TechLead. We wanted to provide our own take on the topic and expand upon these essential skills that separate good developers from great ones. From mastering problem-solving techniques to understanding the importance of clean code architecture, these skills are fundamental for any developer looking to advance their career and create impactful software solutions.",
    category: "Productivity",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Oleg Rostovskyi",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "SMM starter pack, part 2: content promotion",
    content: "This is the second part of the SMM starter pack series of articles. If you made it this far, you must be willing to learn about promoting business through social media. In this comprehensive guide, we'll explore advanced content promotion strategies, audience engagement techniques, and proven methods to increase your brand visibility across all major social media platforms including Instagram, Facebook, Twitter, and LinkedIn.",
    category: "Media",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Patricia Kemp",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "11 Things I Wish I Knew When I Started My Business",
    content: "Here are 11 things I wish I knew when I started my business. I hope they will save you some time and some anguish because experience is a good teacher, but it can also be an expensive one. From understanding cash flow management to building the right team, avoiding common legal pitfalls, and creating sustainable business processes, these lessons learned the hard way will help you navigate the entrepreneurial journey more successfully.",
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
    title: "TikTok Marketing Strategy Guide",
    content: "Harness the power of TikTok for your brand. Learn how to create viral content, engage with Gen Z audiences, and drive real business results on the platform through authentic storytelling and creative campaigns. Understand TikTok's unique culture, master trending hashtags and challenges, collaborate with creators, and implement advertising strategies that resonate with younger demographics while building brand awareness and driving conversions.",
    category: "Media",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Zoe Miller",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "Building a Million Dollar SaaS",
    content: "From idea to IPO - learn the journey of building a successful SaaS business. Real strategies from founders who've scaled to millions in recurring revenue through product-market fit, customer acquisition, and strategic partnerships. Discover how to validate your idea, build an MVP, acquire your first customers, optimize pricing strategies, and scale operations while maintaining high customer satisfaction and retention rates.",
    category: "Business",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Lisa Park",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "React Hooks Deep Dive",
    content: "Master React Hooks with this comprehensive guide. From useState to custom hooks, learn how to write cleaner, more efficient React components that leverage the full power of functional programming. Explore advanced patterns, performance optimization techniques, testing strategies, and real-world examples that demonstrate how hooks can simplify complex state management and improve code reusability across your applications.",
    category: "Productivity",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Tom Anderson",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "JavaScript Performance Optimization Tips",
    content: "Boost your JavaScript application performance with these proven optimization techniques. From memory management to async patterns, improve your code efficiency and user experience. Learn about bundle optimization, lazy loading strategies, caching mechanisms, debugging performance bottlenecks, implementing efficient algorithms, and leveraging modern JavaScript features to create lightning-fast web applications that scale gracefully.",
    category: "Productivity",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Sofia Rodriguez",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "E-commerce Trends Shaping 2024",
    content: "Stay ahead of the curve with the latest e-commerce trends. From AI-powered personalization to sustainable shopping, discover what's driving online retail evolution and how to adapt your business strategy. Learn about emerging technologies, changing consumer behaviors, new payment methods, social commerce opportunities, and innovative marketing approaches that successful e-commerce businesses are implementing today.",
    category: "Business",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Anna Lee",
    authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocILI1j1rpu7whjfKuspQjhwqxhJWXngRkddIFjSYS94e40oMA=s96-c",
    imageUrl: "/default-article-cover.png"
  },
  {
    title: "YouTube Algorithm Mastery",
    content: "Crack the YouTube algorithm and grow your channel organically. Learn the secrets of successful YouTubers and optimize your content for maximum reach and engagement. Understand how thumbnail design, title optimization, audience retention strategies, and community building contribute to channel growth. Master the art of creating compelling content that keeps viewers watching and subscribing for long-term success.",
    category: "Media",
    authorId: "COb1QiaSKjf3IIc2u43tc6mPF8t2",
    authorName: "Kevin Zhang",
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