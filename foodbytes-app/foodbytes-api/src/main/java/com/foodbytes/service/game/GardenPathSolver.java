package com.foodbytes.service.game;

import java.util.Arrays;
import java.util.List;

/**
 * MPP-49: Garden Path rules - start on S, step orthogonally onto open tiles, never revisit, visit
 * every open tile. Mirrors the mockup's pp-engine so client play and server replay agree.
 * The counting DFS prunes only dead branches (unvisited tiles cut off from the head, or more than one
 * forced end), so its counts are exact - GardenPathSolverTest pins them to the mockup fixtures.
 */
public final class GardenPathSolver {

    private GardenPathSolver() {
    }

    public static SolveResult countSolutions(GridMap map, long limit, long nodeBudget) {
        Search search = new Search(map, limit, nodeBudget);
        search.visited[map.start()] = true;
        search.path[0] = map.start();
        search.dfs(map.start(), 1);
        return new SolveResult(search.count, search.budgetExceeded, search.first);
    }

    public static boolean isValidClear(GridMap map, List<Integer> path) {
        if (path == null || path.size() != map.openCount()) return false;
        boolean[] seen = new boolean[map.cells()];
        Integer prev = null;
        for (Integer cell : path) {
            if (cell == null || cell < 0 || cell >= map.cells() || !map.open()[cell] || seen[cell]) return false;
            if (prev == null ? cell != map.start() : !map.adjacent(prev, cell)) return false;
            seen[cell] = true;
            prev = cell;
        }
        return true;
    }

    private static final class Search {
        private final GridMap map;
        private final long limit;
        private final long nodeBudget;
        private final boolean[] visited;
        private final int[] path;
        private final int[][] adjacent;   // open neighbours per cell, built once
        private final int[] reachedStamp; // BFS visit marks, reused across nodes via a rising stamp
        private final int[] queue;
        private int stamp;
        private long count;
        private long nodes;
        private boolean budgetExceeded;
        private int[] first;

        Search(GridMap map, long limit, long nodeBudget) {
            this.map = map;
            this.limit = limit;
            this.nodeBudget = nodeBudget;
            this.visited = new boolean[map.cells()];
            this.path = new int[map.openCount()];
            this.adjacent = new int[map.cells()][];
            for (int i = 0; i < map.cells(); i++) adjacent[i] = map.open()[i] ? map.neighbours(i) : new int[0];
            this.reachedStamp = new int[map.cells()];
            this.queue = new int[map.cells()];
        }

        void dfs(int head, int depth) {
            if (count >= limit || budgetExceeded) return;
            if (++nodes > nodeBudget) {
                budgetExceeded = true;
                return;
            }
            if (depth == map.openCount()) {
                if (first == null) first = Arrays.copyOf(path, depth);
                count++;
                return;
            }
            if (!viable(head, depth)) return;
            for (int next : adjacent[head]) {
                if (visited[next]) continue;
                visited[next] = true;
                path[depth] = next;
                dfs(next, depth + 1);
                visited[next] = false;
            }
        }

        /** Every unvisited tile still reachable from the head, and at most one forced end. */
        private boolean viable(int head, int depth) {
            int forcedEnds = 0;
            for (int i = 0; i < map.cells(); i++) {
                if (!map.open()[i] || visited[i]) continue;
                int free = 0;
                for (int n : adjacent[i]) if (!visited[n] || n == head) free++;
                if (free == 0) return false;
                if (free == 1 && ++forcedEnds > 1) return false;
            }
            stamp++;
            int qHead = 0, qTail = 0;
            queue[qTail++] = head;
            reachedStamp[head] = stamp;
            int found = 0;
            while (qHead < qTail) {
                for (int n : adjacent[queue[qHead++]]) {
                    if (visited[n] || reachedStamp[n] == stamp) continue;
                    reachedStamp[n] = stamp;
                    found++;
                    queue[qTail++] = n;
                }
            }
            return found == map.openCount() - depth;
        }
    }
}
