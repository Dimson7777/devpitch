'use client';

import { useState } from 'react';
import { exampleProjects } from '@/lib/examples';
import { ResultsPanel } from '@/components/results-panel';
import { ChevronDown, ChevronUp } from 'lucide-react';

function ExampleCard({
  project,
  isSelected,
  onSelect,
}: {
  project: typeof exampleProjects[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-white/[0.15] bg-white/[0.04]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.03]'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
              {project.type}
            </span>
            <h3 className="text-sm font-semibold truncate">{project.name}</h3>
          </div>
          <p className="text-[13px] leading-relaxed text-zinc-600 line-clamp-2">
            {project.cvLine}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {project.stack.slice(0, 3).map((tech) => (
              <span key={tech} className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-600">
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="ml-3 shrink-0">
          {isSelected ? (
            <ChevronUp className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          )}
        </div>
      </div>
    </div>
  );
}

export function SavedExamplesSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedExample = exampleProjects.find((e) => e.id === selectedId);

  return (
    <section className="mt-12">
      <div className="mb-6">
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
          Example Outputs
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight">
          See what generated pitches look like
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Click any example to see the full output.
        </p>
      </div>

      <div className="space-y-3">
        {exampleProjects.map((project) => (
          <div key={project.id}>
            <ExampleCard
              project={project}
              isSelected={selectedId === project.id}
              onSelect={() =>
                setSelectedId(selectedId === project.id ? null : project.id)
              }
            />
            {selectedId === project.id && (
              <div className="mt-4">
                <ResultsPanel result={project.fullPitch} isStronger={true} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
