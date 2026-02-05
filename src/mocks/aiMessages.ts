/**
 * MOCK DATA: AI Chat Messages
 * Realistic AI responses for UI development
 */

export interface MockMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface MockConversation {
  id: string;
  title: string;
  messages: MockMessage[];
  createdAt: string;
  updatedAt: string;
}

export const MOCK_AI_RESPONSES = {
  greeting: "Hello! I'm your AI study assistant. I can help you with:\n\n• Explaining complex concepts\n• Answering questions on any subject\n• Creating study plans\n• Generating practice problems\n• Debugging code\n• And much more!\n\nWhat would you like to learn about today?",

  quantumPhysics: "Quantum physics is fascinating! Let me break it down:\n\n**Key Concepts:**\n1. **Wave-Particle Duality**: Particles like electrons can behave as both waves and particles\n2. **Superposition**: Quantum systems can exist in multiple states simultaneously until measured\n3. **Entanglement**: Particles can be connected in ways where measuring one instantly affects another\n\n**Example:**\nImagine Schrödinger's cat - it's both alive and dead until you open the box and observe it. This thought experiment illustrates superposition.\n\n**Applications:**\n- Quantum computers\n- Secure communications\n- Advanced sensors\n\nWould you like me to dive deeper into any specific aspect?",

  calculus: "Great question about calculus! Let me help you understand derivatives:\n\n**What is a Derivative?**\nA derivative measures how a function changes as its input changes. It's the slope of a function at any point.\n\n**Formula:**\n```\nf'(x) = lim(h→0) [f(x+h) - f(x)] / h\n```\n\n**Example:**\nIf f(x) = x², then f'(x) = 2x\n\n**Real-World Application:**\n- **Physics**: Velocity is the derivative of position\n- **Economics**: Marginal cost is the derivative of total cost\n- **Engineering**: Optimization problems\n\n**Practice Problem:**\nFind the derivative of f(x) = 3x³ - 2x + 5\n\nWould you like me to walk you through the solution?",

  studyPlan: "I'll create a personalized study plan for you! Here's a structured approach:\n\n**Week 1-2: Foundations**\n- Day 1-3: Basics & Fundamentals (2 hours/day)\n- Day 4-5: Practice Problems (1.5 hours/day)\n- Weekend: Review & Self-Assessment\n\n**Week 3-4: Deep Dive**\n- Mon-Wed: Advanced Concepts (2.5 hours/day)\n- Thu-Fri: Hands-on Projects (3 hours/day)\n- Weekend: Peer Study Groups\n\n**Week 5-6: Mastery**\n- Mon-Thu: Real-world Applications (2 hours/day)\n- Fri: Quiz & Testing\n- Weekend: Final Project\n\n**Study Tips:**\n✓ Use Pomodoro technique (25 min focus, 5 min break)\n✓ Active recall over passive reading\n✓ Teach concepts to solidify understanding\n✓ Join study groups for motivation\n\nWhat subject should we customize this plan for?",

  historyQuiz: "Excellent! Let's test your history knowledge:\n\n**Question 1:**\nWho was the first President of the United States?\nA) Thomas Jefferson\nB) George Washington\nC) John Adams\nD) Benjamin Franklin\n\n**Question 2:**\nIn what year did World War II end?\nA) 1943\nB) 1944\nC) 1945\nD) 1946\n\n**Question 3:**\nThe Renaissance began in which country?\nA) France\nB) England\nC) Italy\nD) Spain\n\n**Question 4:**\nWho wrote the Declaration of Independence?\nA) George Washington\nB) Thomas Jefferson\nC) Benjamin Franklin\nD) John Adams\n\n**Question 5:**\nThe Great Wall of China was primarily built during which dynasty?\nA) Tang Dynasty\nB) Ming Dynasty\nC) Han Dynasty\nD) Qin Dynasty\n\nReply with your answers (e.g., 1-B, 2-C, etc.) and I'll grade them!",

  codeHelp: "Let me help you debug that code!\n\n**Common Issues to Check:**\n\n1. **Syntax Errors**\n```javascript\n// Wrong\nif (x = 5) { } // Assignment instead of comparison\n\n// Correct\nif (x === 5) { } // Comparison\n```\n\n2. **Undefined Variables**\n```javascript\n// Wrong\nconsole.log(myVar); // ReferenceError\n\n// Correct\nlet myVar = 'Hello';\nconsole.log(myVar);\n```\n\n3. **Scope Issues**\n```javascript\n// Wrong\nif (true) {\n  let x = 5;\n}\nconsole.log(x); // ReferenceError\n\n// Correct\nlet x;\nif (true) {\n  x = 5;\n}\nconsole.log(x);\n```\n\n**Debugging Tips:**\n- Use console.log() to track variable values\n- Check browser/console for error messages\n- Use debugger breakpoints\n- Verify data types with typeof\n\nPaste your code and I'll help identify the issue!",
};

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: 'conv-001',
    title: 'React Hooks Discussion',
    createdAt: '2024-12-01T10:30:00Z',
    updatedAt: '2024-12-01T11:15:00Z',
    messages: [
      {
        id: 'msg-001',
        role: 'user',
        content: 'Can you explain React Hooks?',
        timestamp: '2024-12-01T10:30:00Z',
      },
      {
        id: 'msg-002',
        role: 'assistant',
        content: "Absolutely! React Hooks are functions that let you use state and lifecycle features in functional components.\n\n**Main Hooks:**\n\n1. **useState** - Manages component state\n```jsx\nconst [count, setCount] = useState(0);\n```\n\n2. **useEffect** - Handles side effects\n```jsx\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```\n\n3. **useContext** - Consumes context values\n4. **useRef** - Accesses DOM elements\n5. **useMemo** - Memoizes expensive calculations\n\n**Benefits:**\n✓ Cleaner code\n✓ Better reusability\n✓ Easier testing\n✓ No class boilerplate\n\nWould you like examples of any specific hook?",
        timestamp: '2024-12-01T10:31:30Z',
      },
    ],
  },
  {
    id: 'conv-002',
    title: 'Calculus Help',
    createdAt: '2024-12-02T14:20:00Z',
    updatedAt: '2024-12-02T14:45:00Z',
    messages: [
      {
        id: 'msg-003',
        role: 'user',
        content: 'Help me understand integration',
        timestamp: '2024-12-02T14:20:00Z',
      },
      {
        id: 'msg-004',
        role: 'assistant',
        content: MOCK_AI_RESPONSES.calculus,
        timestamp: '2024-12-02T14:22:00Z',
      },
    ],
  },
  {
    id: 'conv-003',
    title: 'Python Study Plan',
    createdAt: '2024-12-03T09:00:00Z',
    updatedAt: '2024-12-03T09:20:00Z',
    messages: [
      {
        id: 'msg-005',
        role: 'user',
        content: 'Create a study plan for learning Python',
        timestamp: '2024-12-03T09:00:00Z',
      },
      {
        id: 'msg-006',
        role: 'assistant',
        content: MOCK_AI_RESPONSES.studyPlan,
        timestamp: '2024-12-03T09:01:45Z',
      },
    ],
  },
];

export const MOCK_SUGGESTED_PROMPTS = [
  'Explain quantum physics in simple terms',
  'Help me with calculus derivatives',
  'Create a personalized study plan',
  'Quiz me on world history',
  'Explain machine learning algorithms',
  'How do I prepare for coding interviews?',
  'Teach me about data structures',
  'What are the best study techniques?',
];

export const generateMockAIResponse = (userMessage: string): string => {
  const lowercaseMsg = userMessage.toLowerCase();

  // React & Frontend
  if (lowercaseMsg.includes('react')) {
    return "**React** is a popular JavaScript library for building user interfaces!\n\n**Key Concepts:**\n\n1. **Components** - Reusable UI building blocks\n```jsx\nfunction Welcome() {\n  return <h1>Hello, World!</h1>;\n}\n```\n\n2. **JSX** - JavaScript XML syntax\n3. **Props** - Pass data to components\n4. **State** - Manage component data\n5. **Hooks** - useState, useEffect, etc.\n\n**Why React?**\n✓ Component-based architecture\n✓ Virtual DOM for performance\n✓ Large ecosystem\n✓ Backed by Meta (Facebook)\n\n**Example:**\n```jsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Clicked {count} times\n    </button>\n  );\n}\n```\n\nWould you like to learn about specific React features?";
  }

  if (lowercaseMsg.includes('javascript') || lowercaseMsg.includes('js')) {
    return "**JavaScript** is the programming language of the web!\n\n**Core Concepts:**\n\n1. **Variables**\n```javascript\nlet name = 'John';  // Can change\nconst age = 25;     // Cannot change\nvar old = 'avoid';  // Old way\n```\n\n2. **Functions**\n```javascript\n// Function declaration\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\n// Arrow function\nconst greet = (name) => `Hello, ${name}!`;\n```\n\n3. **Arrays & Objects**\n```javascript\nconst fruits = ['apple', 'banana'];\nconst person = { name: 'John', age: 25 };\n```\n\n**Modern Features:**\n✓ Async/Await\n✓ Destructuring\n✓ Spread operator\n✓ Template literals\n\nWhat would you like to explore?";
  }

  if (lowercaseMsg.includes('python')) {
    return "**Python** is a versatile, beginner-friendly programming language!\n\n**Why Python?**\n✓ Easy to read and write\n✓ Huge library ecosystem\n✓ Great for AI/ML, web, automation\n✓ High demand in job market\n\n**Basic Syntax:**\n```python\n# Variables\nname = 'Alice'\nage = 25\n\n# Functions\ndef greet(name):\n    return f'Hello, {name}!'\n\n# Lists\nfruits = ['apple', 'banana', 'orange']\n\n# Loops\nfor fruit in fruits:\n    print(fruit)\n```\n\n**Popular Uses:**\n- Data Science (Pandas, NumPy)\n- Machine Learning (TensorFlow, PyTorch)\n- Web Development (Django, Flask)\n- Automation & Scripting\n\nWhat aspect of Python interests you?";
  }

  if (lowercaseMsg.includes('html') || lowercaseMsg.includes('css')) {
    return "**HTML & CSS** are the foundation of web development!\n\n**HTML (Structure):**\n```html\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Welcome!</h1>\n    <p>This is a paragraph.</p>\n  </body>\n</html>\n```\n\n**CSS (Styling):**\n```css\nh1 {\n  color: #FFD700;\n  font-size: 2rem;\n  text-align: center;\n}\n\np {\n  color: #333;\n  line-height: 1.6;\n}\n```\n\n**Key Concepts:**\n- **HTML**: Tags, attributes, semantic elements\n- **CSS**: Selectors, flexbox, grid, animations\n\n**Modern CSS:**\n✓ Flexbox for layouts\n✓ Grid for complex designs\n✓ Variables (custom properties)\n✓ Animations & transitions\n\nNeed help with a specific layout?";
  }

  if (lowercaseMsg.includes('quantum') || lowercaseMsg.includes('physics')) {
    return MOCK_AI_RESPONSES.quantumPhysics;
  }
  if (lowercaseMsg.includes('calculus') || lowercaseMsg.includes('derivative') || lowercaseMsg.includes('integral')) {
    return MOCK_AI_RESPONSES.calculus;
  }
  if (lowercaseMsg.includes('study plan') || lowercaseMsg.includes('schedule')) {
    return MOCK_AI_RESPONSES.studyPlan;
  }
  if (lowercaseMsg.includes('quiz') || lowercaseMsg.includes('history')) {
    return MOCK_AI_RESPONSES.historyQuiz;
  }
  if (lowercaseMsg.includes('code') || lowercaseMsg.includes('debug') || lowercaseMsg.includes('error')) {
    return MOCK_AI_RESPONSES.codeHelp;
  }
  if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi') || lowercaseMsg.includes('hey')) {
    return MOCK_AI_RESPONSES.greeting;
  }

  // Machine Learning / AI
  if (lowercaseMsg.includes('machine learning') || lowercaseMsg.includes('ml') || lowercaseMsg.includes('ai')) {
    return "**Machine Learning** is teaching computers to learn from data!\n\n**Types of ML:**\n\n1. **Supervised Learning**\n   - Classification (spam detection)\n   - Regression (price prediction)\n\n2. **Unsupervised Learning**\n   - Clustering (customer segmentation)\n   - Dimensionality reduction\n\n3. **Reinforcement Learning**\n   - Game playing (AlphaGo)\n   - Robotics\n\n**Popular Algorithms:**\n- Linear Regression\n- Decision Trees\n- Neural Networks\n- K-Means Clustering\n\n**Tools:**\n- Python (Scikit-learn, TensorFlow, PyTorch)\n- R\n- Jupyter Notebooks\n\nWhat ML topic interests you?";
  }

  // Default intelligent response
  return `Great question about **"${userMessage}"**! Let me help you understand this topic.\n\n**Here's what I can explain:**\n\n📚 **Concept Overview** - I'll break down the fundamentals\n💡 **Key Points** - Important things to remember\n🔨 **Practical Examples** - Real-world applications\n✅ **Best Practices** - How to apply this effectively\n\n**To give you the best answer, could you specify:**\n- What aspect are you most interested in?\n- Are you looking for beginner or advanced information?\n- Do you need examples or theoretical explanation?\n\n**Popular topics I can help with:**\n- Programming (JavaScript, Python, React, etc.)\n- Mathematics (Calculus, Algebra, Statistics)\n- Computer Science (Algorithms, Data Structures)\n- Web Development (HTML, CSS, Frameworks)\n- And much more!\n\nFeel free to ask a more specific question, and I'll provide a detailed explanation!`;
};
