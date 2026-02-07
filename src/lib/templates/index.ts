export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
  category: 'work' | 'personal' | 'education' | 'creative';
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start with an empty document',
    icon: '📄',
    content: '',
    category: 'work',
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Template for meeting documentation',
    icon: '📝',
    content: `<h1>Meeting Notes</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Attendees:</strong> </p>
<ul>
  <li><p></p></li>
</ul>

<h2>Agenda</h2>
<ol>
  <li><p></p></li>
</ol>

<h2>Discussion Points</h2>
<p></p>

<h2>Action Items</h2>
<ul>
  <li><p></p></li>
</ul>

<h2>Next Steps</h2>
<p></p>`,
    category: 'work',
  },
  {
    id: 'project-proposal',
    name: 'Project Proposal',
    description: 'Professional project proposal template',
    icon: '📊',
    content: `<h1>Project Proposal</h1>

<h2>Executive Summary</h2>
<p></p>

<h2>Project Overview</h2>
<p></p>

<h2>Objectives</h2>
<ul>
  <li><p></p></li>
</ul>

<h2>Scope</h2>
<p></p>

<h2>Timeline</h2>
<p></p>

<h2>Budget</h2>
<p></p>

<h2>Team & Resources</h2>
<p></p>

<h2>Success Metrics</h2>
<ul>
  <li><p></p></li>
</ul>`,
    category: 'work',
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    description: 'Personal daily reflection template',
    icon: '📔',
    content: `<h1>Daily Journal</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

<h2>Morning Reflection</h2>
<p><strong>How I'm feeling:</strong> </p>
<p><strong>Today's goals:</strong></p>
<ul>
  <li><p></p></li>
</ul>

<h2>Daily Highlights</h2>
<p></p>

<h2>Challenges & Solutions</h2>
<p></p>

<h2>Gratitude</h2>
<p>Three things I'm grateful for today:</p>
<ol>
  <li><p></p></li>
  <li><p></p></li>
  <li><p></p></li>
</ol>

<h2>Evening Reflection</h2>
<p><strong>What went well:</strong> </p>
<p><strong>What I learned:</strong> </p>
<p><strong>Tomorrow's priorities:</strong> </p>`,
    category: 'personal',
  },
  {
    id: 'research-notes',
    name: 'Research Notes',
    description: 'Structured research documentation',
    icon: '🔬',
    content: `<h1>Research Notes</h1>
<p><strong>Topic:</strong> </p>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

<h2>Research Question</h2>
<p></p>

<h2>Key Findings</h2>
<ul>
  <li><p></p></li>
</ul>

<h2>Sources</h2>
<ol>
  <li><p></p></li>
</ol>

<h2>Notes & Observations</h2>
<p></p>

<h2>Quotes & References</h2>
<blockquote><p></p></blockquote>

<h2>Conclusion</h2>
<p></p>

<h2>Next Steps</h2>
<ul>
  <li><p></p></li>
</ul>`,
    category: 'education',
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Blog post writing template',
    icon: '✍️',
    content: `<h1>Blog Post Title</h1>

<p><em>Introduction: Hook your readers with an engaging opening paragraph...</em></p>

<h2>The Problem</h2>
<p></p>

<h2>The Solution</h2>
<p></p>

<h2>How It Works</h2>
<ol>
  <li><p></p></li>
</ol>

<h2>Benefits</h2>
<ul>
  <li><p></p></li>
</ul>

<h2>Examples & Case Studies</h2>
<p></p>

<h2>Conclusion</h2>
<p></p>

<p><strong>Call to Action:</strong> </p>`,
    category: 'creative',
  },
  {
    id: 'brainstorm',
    name: 'Ideas & Brainstorm',
    description: 'Creative brainstorming template',
    icon: '💡',
    content: `<h1>Brainstorming Session</h1>
<p><strong>Topic:</strong> </p>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

<h2>Goal / Problem Statement</h2>
<p></p>

<h2>Initial Ideas</h2>
<ul>
  <li><p></p></li>
</ul>

<h2>Wild Ideas (No Bad Ideas!)</h2>
<ul>
  <li><p></p></li>
</ul>

<h2>Refined Concepts</h2>
<ol>
  <li><p></p></li>
</ol>

<h2>Selected Ideas</h2>
<p></p>

<h2>Next Steps</h2>
<ul>
  <li><p></p></li>
</ul>`,
    category: 'creative',
  },
  {
    id: 'task-list',
    name: 'Task List',
    description: 'Organized task management',
    icon: '✅',
    content: `<h1>Task List</h1>
<p><strong>Week of:</strong> ${new Date().toLocaleDateString()}</p>

<h2>High Priority</h2>
<ul>
  <li><p>🔴 </p></li>
</ul>

<h2>Medium Priority</h2>
<ul>
  <li><p>🟡 </p></li>
</ul>

<h2>Low Priority</h2>
<ul>
  <li><p>🟢 </p></li>
</ul>

<h2>Completed</h2>
<ul>
  <li><p>✅ </p></li>
</ul>

<h2>Backlog</h2>
<ul>
  <li><p></p></li>
</ul>`,
    category: 'work',
  },
  {
    id: 'lesson-plan',
    name: 'Lesson Plan',
    description: 'Educational lesson planning',
    icon: '🎓',
    content: `<h1>Lesson Plan</h1>
<p><strong>Subject:</strong> </p>
<p><strong>Grade/Level:</strong> </p>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Duration:</strong> </p>

<h2>Learning Objectives</h2>
<p>Students will be able to:</p>
<ul>
  <li><p></p></li>
</ul>

<h2>Materials Needed</h2>
<ul>
  <li><p></p></li>
</ul>

<h2>Introduction (__ minutes)</h2>
<p></p>

<h2>Main Activity (__ minutes)</h2>
<p></p>

<h2>Practice/Application (__ minutes)</h2>
<p></p>

<h2>Assessment</h2>
<p></p>

<h2>Closure (__ minutes)</h2>
<p></p>

<h2>Homework/Extension</h2>
<p></p>`,
    category: 'education',
  },
  {
    id: 'recipe',
    name: 'Recipe',
    description: 'Cooking recipe template',
    icon: '🍳',
    content: `<h1>Recipe Name</h1>

<p><strong>Prep Time:</strong> __ minutes</p>
<p><strong>Cook Time:</strong> __ minutes</p>
<p><strong>Servings:</strong> __</p>
<p><strong>Difficulty:</strong> Easy / Medium / Hard</p>

<h2>Ingredients</h2>
<ul>
  <li><p></p></li>
</ul>

<h2>Instructions</h2>
<ol>
  <li><p></p></li>
</ol>

<h2>Tips & Variations</h2>
<p></p>

<h2>Notes</h2>
<p></p>`,
    category: 'personal',
  },
];

export function getTemplateById(id: string): DocumentTemplate | undefined {
  return documentTemplates.find(template => template.id === id);
}

export function getTemplatesByCategory(category: DocumentTemplate['category']): DocumentTemplate[] {
  return documentTemplates.filter(template => template.category === category);
}
