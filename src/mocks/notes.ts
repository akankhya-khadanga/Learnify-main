/**
 * MOCK DATA: Notes & Documents
 * Sample notes, folders, and PDF documents for UI development
 */

export interface MockNote {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  color?: string;
  attachments?: MockAttachment[];
}

export interface MockFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  noteCount: number;
  createdAt: string;
}

export interface MockAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  size: number; // in bytes
  url: string;
  uploadedAt: string;
}

export const MOCK_FOLDERS: MockFolder[] = [
  {
    id: 'folder-001',
    name: 'React Notes',
    color: '#61DAFB',
    icon: '⚛️',
    noteCount: 12,
    createdAt: '2024-10-15',
  },
  {
    id: 'folder-002',
    name: 'Python Scripts',
    color: '#3776AB',
    icon: '🐍',
    noteCount: 8,
    createdAt: '2024-09-20',
  },
  {
    id: 'folder-003',
    name: 'ML Algorithms',
    color: '#FF6B6B',
    icon: '🤖',
    noteCount: 15,
    createdAt: '2024-11-01',
  },
  {
    id: 'folder-004',
    name: 'Design Resources',
    color: '#9B59B6',
    icon: '🎨',
    noteCount: 6,
    createdAt: '2024-10-28',
  },
];

export const MOCK_NOTES: MockNote[] = [
  {
    id: 'note-001',
    title: 'React Hooks Cheat Sheet',
    content: `# React Hooks Cheat Sheet

## useState
\`\`\`jsx
const [state, setState] = useState(initialValue);
\`\`\`
- Manages component state
- Returns current state and updater function
- Can use functional updates: \`setState(prev => prev + 1)\`

## useEffect
\`\`\`jsx
useEffect(() => {
  // Side effect code
  return () => {
    // Cleanup code
  };
}, [dependencies]);
\`\`\`
- Runs after render
- Cleanup function runs before next effect or unmount
- Empty deps array = run once on mount

## useContext
\`\`\`jsx
const value = useContext(MyContext);
\`\`\`
- Consumes context values
- Re-renders when context value changes

## useMemo & useCallback
\`\`\`jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => { doSomething(a, b) }, [a, b]);
\`\`\`
- useMemo: Memoize computed values
- useCallback: Memoize function references

## Custom Hooks
- Start with "use"
- Can call other hooks
- Reusable stateful logic`,
    folderId: 'folder-001',
    tags: ['React', 'Hooks', 'Reference'],
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-12-01T14:20:00Z',
    isPinned: true,
    color: '#61DAFB',
  },
  {
    id: 'note-002',
    title: 'Python Data Structures',
    content: `# Python Data Structures

## Lists
\`\`\`python
my_list = [1, 2, 3, 4]
my_list.append(5)  # Add item
my_list.pop()      # Remove last item
my_list[0]         # Access by index
\`\`\`

## Dictionaries
\`\`\`python
my_dict = {'key': 'value', 'age': 25}
my_dict['new_key'] = 'new_value'
my_dict.get('key', 'default')
\`\`\`

## Sets
\`\`\`python
my_set = {1, 2, 3}
my_set.add(4)
my_set.remove(1)
\`\`\`

## Tuples
\`\`\`python
my_tuple = (1, 2, 3)  # Immutable
\`\`\`

## List Comprehensions
\`\`\`python
squares = [x**2 for x in range(10)]
evens = [x for x in range(10) if x % 2 == 0]
\`\`\``,
    folderId: 'folder-002',
    tags: ['Python', 'Data Structures'],
    createdAt: '2024-10-22T09:15:00Z',
    updatedAt: '2024-10-22T09:15:00Z',
    isPinned: false,
    color: '#3776AB',
  },
  {
    id: 'note-003',
    title: 'Machine Learning Basics',
    content: `# Machine Learning Fundamentals

## Types of ML

### Supervised Learning
- Regression (continuous output)
- Classification (discrete output)
- Examples: Linear Regression, Logistic Regression, SVM, Neural Networks

### Unsupervised Learning
- Clustering
- Dimensionality Reduction
- Examples: K-Means, PCA, Autoencoders

### Reinforcement Learning
- Agent learns through rewards/penalties
- Examples: Q-Learning, Deep Q Networks

## Common Algorithms

### Linear Regression
\`\`\`python
from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)
\`\`\`

### Decision Trees
\`\`\`python
from sklearn.tree import DecisionTreeClassifier
clf = DecisionTreeClassifier()
clf.fit(X_train, y_train)
\`\`\`

## Model Evaluation
- Accuracy
- Precision & Recall
- F1 Score
- ROC-AUC
- Cross-validation`,
    folderId: 'folder-003',
    tags: ['ML', 'Algorithms', 'Scikit-learn'],
    createdAt: '2024-11-05T16:45:00Z',
    updatedAt: '2024-11-20T11:30:00Z',
    isPinned: true,
    color: '#FF6B6B',
    attachments: [
      {
        id: 'att-001',
        name: 'ml-cheatsheet.pdf',
        type: 'pdf',
        size: 2456789,
        url: '#',
        uploadedAt: '2024-11-05T16:50:00Z',
      },
    ],
  },
  {
    id: 'note-004',
    title: 'CSS Flexbox Guide',
    content: `# CSS Flexbox Complete Guide

## Container Properties

\`\`\`css
.container {
  display: flex;
  flex-direction: row | column;
  justify-content: flex-start | center | flex-end | space-between | space-around;
  align-items: stretch | center | flex-start | flex-end;
  flex-wrap: nowrap | wrap | wrap-reverse;
  gap: 10px;
}
\`\`\`

## Item Properties

\`\`\`css
.item {
  flex-grow: 0;     /* Growth factor */
  flex-shrink: 1;   /* Shrink factor */
  flex-basis: auto; /* Initial size */
  flex: 1;          /* Shorthand */
  align-self: auto | flex-start | flex-end | center;
  order: 0;         /* Display order */
}
\`\`\`

## Common Patterns

### Centering
\`\`\`css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

### Equal Columns
\`\`\`css
.item {
  flex: 1;
}
\`\`\``,
    folderId: 'folder-004',
    tags: ['CSS', 'Flexbox', 'Layout'],
    createdAt: '2024-11-18T13:20:00Z',
    updatedAt: '2024-11-18T13:20:00Z',
    isPinned: false,
    color: '#9B59B6',
  },
  {
    id: 'note-005',
    title: 'Git Commands Reference',
    content: `# Essential Git Commands

## Basic Commands
\`\`\`bash
git init                    # Initialize repository
git clone <url>             # Clone repository
git status                  # Check status
git add .                   # Stage all files
git commit -m "message"     # Commit changes
git push origin main        # Push to remote
git pull origin main        # Pull from remote
\`\`\`

## Branching
\`\`\`bash
git branch                  # List branches
git branch <name>           # Create branch
git checkout <name>         # Switch branch
git checkout -b <name>      # Create and switch
git merge <branch>          # Merge branch
git branch -d <name>        # Delete branch
\`\`\`

## Undoing Changes
\`\`\`bash
git reset HEAD~1            # Undo last commit
git revert <commit>         # Revert specific commit
git checkout -- <file>      # Discard changes
git stash                   # Stash changes
git stash pop               # Apply stashed changes
\`\`\`

## Remote Management
\`\`\`bash
git remote -v               # List remotes
git remote add origin <url> # Add remote
git fetch                   # Fetch changes
git log --oneline           # View commit history
\`\`\``,
    folderId: null,
    tags: ['Git', 'Version Control', 'Commands'],
    createdAt: '2024-10-10T08:00:00Z',
    updatedAt: '2024-10-10T08:00:00Z',
    isPinned: false,
  },
];

export const getMockNotes = (): MockNote[] => {
  return MOCK_NOTES;
};

export const getMockFolders = (): MockFolder[] => {
  return MOCK_FOLDERS;
};

export const getMockNotesByFolder = (folderId: string): MockNote[] => {
  return MOCK_NOTES.filter(note => note.folderId === folderId);
};

export const getMockNote = (id: string): MockNote | undefined => {
  return MOCK_NOTES.find(note => note.id === id);
};
