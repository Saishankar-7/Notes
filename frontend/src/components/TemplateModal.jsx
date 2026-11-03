import { X, FileText, CheckSquare, BookOpen, Layers, Target } from 'lucide-react';

const NOTE_TEMPLATES = [
  {
    id: 'meeting',
    name: 'Meeting Notes',
    icon: CheckSquare,
    category: 'Work',
    description: 'Track agenda, attendees, key decisions, and action items.',
    content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 

## Agenda
1. 
2. 

## Key Discussion Points
- 

## Action Items
- [ ] Task 1 (Assignee)
- [ ] Task 2 (Assignee)
`,
  },
  {
    id: 'study',
    name: 'Study Guide / Lab',
    icon: BookOpen,
    category: 'Study',
    description: 'Structured layout for core concepts, formulas, and summaries.',
    content: `# Study Guide: [Subject / Topic]

## 1. Core Concepts
- Concept 1: Definition and key takeaways
- Concept 2: Key formula / mechanism

## 2. Important Notes & Examples
- Example A:
- Example B:

## 3. Summary & Review Questions
- Q1:
`,
  },
  {
    id: 'project',
    name: 'Project Plan',
    icon: Target,
    category: 'Work',
    description: 'Define milestones, goals, deliverables, and roadblocks.',
    content: `# Project Plan: [Project Name]

## Goals & Objectives
- Objective 1:
- Objective 2:

## Deliverables & Milestones
- [ ] Milestone 1 (Target Date)
- [ ] Milestone 2 (Target Date)

## Risks & Mitigations
- Risk 1:
`,
  },
  {
    id: 'chem',
    name: 'Lab / Chemistry Notes',
    icon: Layers,
    category: 'Periodic table',
    description: 'Experiment objectives, observations, reactions, and analysis.',
    content: `# Experiment / Topic: Periodic Table & Chemical Reactions

## Objective
- 

## Observations & Reactions
- Compound A + Compound B -> 

## Conclusion
- 
`,
  },
  {
    id: 'blank',
    name: 'Blank Note',
    icon: FileText,
    category: 'No subject',
    description: 'Start fresh with a clean slate.',
    content: '',
  },
];

export const TemplateModal = ({ isOpen, onClose, onSelectTemplate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl text-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Browse Note Templates</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose a structured layout to jumpstart your note-taking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {NOTE_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate({
                    title: tmpl.name,
                    category: tmpl.category,
                    content: tmpl.content,
                  });
                  onClose();
                }}
                className="group cursor-pointer rounded-xl border border-gray-200 p-4 hover:border-black/30 hover:shadow-md transition-all bg-gray-50/50 hover:bg-white"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white transition-colors text-gray-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">{tmpl.name}</h3>
                    <span className="text-[11px] text-gray-500">{tmpl.category}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{tmpl.description}</p>
                <div className="mt-3 flex justify-end">
                  <span className="text-xs font-semibold text-gray-900 group-hover:underline">
                    Use Template &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;

