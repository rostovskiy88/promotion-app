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