import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/Callout";
import { ComplexityChart } from "@/components/mdx/ComplexityChart";
import { DecisionTree } from "@/components/mdx/DecisionTree";
import { FlowDiagram } from "@/components/mdx/FlowDiagram";
import { QA } from "@/components/mdx/QA";
import { Quiz } from "@/components/mdx/Quiz";
import { Resources } from "@/components/mdx/Resources";
import { Term } from "@/components/mdx/Term";
import { TypePuzzle } from "@/components/mdx/TypePuzzle";
import {
  BackpressureViz,
  BinarySearchViz,
  ClosureViz,
  ConsistentHashingViz,
  DijkstraViz,
  DynamicArrayViz,
  EventLoopViz,
  FenwickViz,
  GraphTraversalViz,
  HiddenClassViz,
  HooksViz,
  HouseRobberViz,
  IntervalsViz,
  KruskalViz,
  LcsViz,
  LinkedListViz,
  LoadBalancerViz,
  LruViz,
  MarkSweepViz,
  MonotonicStackViz,
  PopcountViz,
  PrefixSumViz,
  PromisePoolViz,
  PrototypeViz,
  ReconcileViz,
  RerenderViz,
  SlidingWindowViz,
  SubsetsViz,
  ThreadPoolViz,
  TokenBucketViz,
  TopKViz,
  TopoSortViz,
  TreeTraversalViz,
  TrieViz,
  TwoPointersViz,
  UnionFindViz,
} from "@/components/visualizer/viz/lazy";

// Components available in every lesson without an import, visualizers
// included. The lesson page passes this object to the MDX content, which keeps
// every client component statically reachable from the page module (needed by
// Next's instant-navigation validation). Visualizers come from viz/lazy, so the
// browser downloads each one only on pages that render it.
export const mdxComponents = {
  Callout,
  ComplexityChart,
  DecisionTree,
  FlowDiagram,
  QA,
  Quiz,
  Resources,
  Term,
  TypePuzzle,
  BackpressureViz,
  BinarySearchViz,
  ClosureViz,
  ConsistentHashingViz,
  DijkstraViz,
  DynamicArrayViz,
  EventLoopViz,
  FenwickViz,
  GraphTraversalViz,
  HiddenClassViz,
  HooksViz,
  HouseRobberViz,
  IntervalsViz,
  KruskalViz,
  LcsViz,
  LinkedListViz,
  LoadBalancerViz,
  LruViz,
  MarkSweepViz,
  MonotonicStackViz,
  PopcountViz,
  PrefixSumViz,
  PromisePoolViz,
  PrototypeViz,
  ReconcileViz,
  RerenderViz,
  SlidingWindowViz,
  SubsetsViz,
  ThreadPoolViz,
  TokenBucketViz,
  TopKViz,
  TopoSortViz,
  TreeTraversalViz,
  TrieViz,
  TwoPointersViz,
  UnionFindViz,
  table: (props: React.ComponentProps<"table">) => (
    // Phones: edge to edge, smaller text, and a sticky first column so the
    // row label stays visible while the other columns scroll sideways.
    <div className="not-prose -mx-4 my-6 overflow-x-auto overscroll-x-contain border-y border-border sm:mx-0 sm:rounded-lg sm:border">
      <table
        className="w-full border-collapse text-[0.8125rem] sm:text-sm [&_td]:border-t [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_th]:bg-surface-1 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:align-bottom [&_th]:font-semibold max-sm:[&_td:first-child]:sticky max-sm:[&_td:first-child]:left-0 max-sm:[&_td:first-child]:bg-bg max-sm:[&_td:first-child]:font-medium max-sm:[&_td:first-child]:shadow-[1px_0_0_var(--border)] max-sm:[&_th:first-child]:sticky max-sm:[&_th:first-child]:left-0 max-sm:[&_th:first-child]:z-10 max-sm:[&_th:first-child]:shadow-[1px_0_0_var(--border)] [&_td:first-child]:min-w-28 [&_td]:min-w-36"
        {...props}
      />
    </div>
  ),
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return mdxComponents;
}
