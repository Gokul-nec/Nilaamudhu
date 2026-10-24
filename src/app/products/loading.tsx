import { SkeletonCard } from "@/components/ui";

export default function Loading() {
  return (
    <div className="container-page py-10" aria-busy="true">
      <div className="skeleton h-12 w-2/3 max-w-md" />
      <div className="skeleton mt-6 h-12 w-full" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
