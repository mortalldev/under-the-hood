"use client";

// Each visualizer in its own lazily loaded chunk: a lesson downloads only the
// visualizers it renders, not all ~36 (plus their algorithms). Server rendering
// still includes them, and Next preloads the chunks a page uses, so nothing pops in.
import dynamic from "next/dynamic";

function VizPlaceholder() {
  return <div aria-hidden="true" className="not-prose -mx-4 my-8 min-h-[28rem] border-y border-border bg-surface-1 sm:mx-0 sm:rounded-xl sm:border" />;
}


export const BackpressureViz = dynamic(() => import("./BackpressureViz").then((m) => m.BackpressureViz), { loading: VizPlaceholder });
export const BinarySearchViz = dynamic(() => import("./BinarySearchViz").then((m) => m.BinarySearchViz), { loading: VizPlaceholder });
export const ClosureViz = dynamic(() => import("./ClosureViz").then((m) => m.ClosureViz), { loading: VizPlaceholder });
export const ConsistentHashingViz = dynamic(() => import("./ConsistentHashingViz").then((m) => m.ConsistentHashingViz), { loading: VizPlaceholder });
export const DijkstraViz = dynamic(() => import("./DijkstraViz").then((m) => m.DijkstraViz), { loading: VizPlaceholder });
export const DynamicArrayViz = dynamic(() => import("./DynamicArrayViz").then((m) => m.DynamicArrayViz), { loading: VizPlaceholder });
export const EventLoopViz = dynamic(() => import("./EventLoopViz").then((m) => m.EventLoopViz), { loading: VizPlaceholder });
export const FenwickViz = dynamic(() => import("./FenwickViz").then((m) => m.FenwickViz), { loading: VizPlaceholder });
export const GraphTraversalViz = dynamic(() => import("./GraphTraversalViz").then((m) => m.GraphTraversalViz), { loading: VizPlaceholder });
export const HiddenClassViz = dynamic(() => import("./HiddenClassViz").then((m) => m.HiddenClassViz), { loading: VizPlaceholder });
export const HooksViz = dynamic(() => import("./HooksViz").then((m) => m.HooksViz), { loading: VizPlaceholder });
export const HouseRobberViz = dynamic(() => import("./HouseRobberViz").then((m) => m.HouseRobberViz), { loading: VizPlaceholder });
export const IntervalsViz = dynamic(() => import("./IntervalsViz").then((m) => m.IntervalsViz), { loading: VizPlaceholder });
export const KruskalViz = dynamic(() => import("./KruskalViz").then((m) => m.KruskalViz), { loading: VizPlaceholder });
export const LcsViz = dynamic(() => import("./LcsViz").then((m) => m.LcsViz), { loading: VizPlaceholder });
export const LinkedListViz = dynamic(() => import("./LinkedListViz").then((m) => m.LinkedListViz), { loading: VizPlaceholder });
export const LoadBalancerViz = dynamic(() => import("./LoadBalancerViz").then((m) => m.LoadBalancerViz), { loading: VizPlaceholder });
export const LruViz = dynamic(() => import("./LruViz").then((m) => m.LruViz), { loading: VizPlaceholder });
export const MarkSweepViz = dynamic(() => import("./MarkSweepViz").then((m) => m.MarkSweepViz), { loading: VizPlaceholder });
export const MonotonicStackViz = dynamic(() => import("./MonotonicStackViz").then((m) => m.MonotonicStackViz), { loading: VizPlaceholder });
export const PopcountViz = dynamic(() => import("./PopcountViz").then((m) => m.PopcountViz), { loading: VizPlaceholder });
export const PrefixSumViz = dynamic(() => import("./PrefixSumViz").then((m) => m.PrefixSumViz), { loading: VizPlaceholder });
export const PromisePoolViz = dynamic(() => import("./PromisePoolViz").then((m) => m.PromisePoolViz), { loading: VizPlaceholder });
export const PrototypeViz = dynamic(() => import("./PrototypeViz").then((m) => m.PrototypeViz), { loading: VizPlaceholder });
export const ReconcileViz = dynamic(() => import("./ReconcileViz").then((m) => m.ReconcileViz), { loading: VizPlaceholder });
export const RerenderViz = dynamic(() => import("./RerenderViz").then((m) => m.RerenderViz), { loading: VizPlaceholder });
export const SlidingWindowViz = dynamic(() => import("./SlidingWindowViz").then((m) => m.SlidingWindowViz), { loading: VizPlaceholder });
export const SubsetsViz = dynamic(() => import("./SubsetsViz").then((m) => m.SubsetsViz), { loading: VizPlaceholder });
export const ThreadPoolViz = dynamic(() => import("./ThreadPoolViz").then((m) => m.ThreadPoolViz), { loading: VizPlaceholder });
export const TokenBucketViz = dynamic(() => import("./TokenBucketViz").then((m) => m.TokenBucketViz), { loading: VizPlaceholder });
export const TopKViz = dynamic(() => import("./TopKViz").then((m) => m.TopKViz), { loading: VizPlaceholder });
export const TopoSortViz = dynamic(() => import("./TopoSortViz").then((m) => m.TopoSortViz), { loading: VizPlaceholder });
export const TreeTraversalViz = dynamic(() => import("./TreeTraversalViz").then((m) => m.TreeTraversalViz), { loading: VizPlaceholder });
export const TrieViz = dynamic(() => import("./TrieViz").then((m) => m.TrieViz), { loading: VizPlaceholder });
export const TwoPointersViz = dynamic(() => import("./TwoPointersViz").then((m) => m.TwoPointersViz), { loading: VizPlaceholder });
export const PrincipleViz = dynamic(() => import("./PrincipleViz").then((m) => m.PrincipleViz), { loading: VizPlaceholder });
export const UnionFindViz = dynamic(() => import("./UnionFindViz").then((m) => m.UnionFindViz), { loading: VizPlaceholder });
