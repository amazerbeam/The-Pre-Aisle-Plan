package com.foodbytes.service.game;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * MPP-49: a walker board. Cells are indexed y * width + x; legend S = Pip's start, . = open, # = rock
 * (the mockup's pp-levels legend). Width is capped at MAX_COLS so tiles stay >= 44 px at 320 px.
 */
public record GridMap(int width, int height, boolean[] open, int start, int openCount) {

    public static final int MAX_COLS = 6;
    public static final char START = 'S', OPEN = '.', ROCK = '#';
    private static final String ROW_SEPARATOR = "/";

    public static GridMap parse(List<String> rows) {
        if (rows == null || rows.isEmpty()) throw new IllegalArgumentException("A map needs at least one row");
        int width = rows.get(0).length();
        if (width == 0 || width > MAX_COLS) throw new IllegalArgumentException("Map width must be 1-" + MAX_COLS);
        int height = rows.size();
        boolean[] open = new boolean[width * height];
        int start = -1, openCount = 0;
        for (int y = 0; y < height; y++) {
            String row = rows.get(y);
            if (row.length() != width) throw new IllegalArgumentException("Rows must be the same length");
            for (int x = 0; x < width; x++) {
                char c = row.charAt(x);
                int i = y * width + x;
                if (c == START) {
                    if (start >= 0) throw new IllegalArgumentException("A map has exactly one start");
                    start = i;
                } else if (c != OPEN && c != ROCK) {
                    throw new IllegalArgumentException("Unknown tile '" + c + "'");
                }
                open[i] = c != ROCK;
                if (open[i]) openCount++;
            }
        }
        if (start < 0) throw new IllegalArgumentException("A map has exactly one start");
        return new GridMap(width, height, open, start, openCount);
    }

    public static GridMap fromLayout(String layout, int width, int height) {
        GridMap map = parse(List.of(layout.split(ROW_SEPARATOR)));
        if (map.width() != width || map.height() != height) throw new IllegalArgumentException("Layout size mismatch");
        return map;
    }

    public List<String> rows() {
        List<String> rows = new ArrayList<>(height);
        for (int y = 0; y < height; y++) {
            StringBuilder row = new StringBuilder(width);
            for (int x = 0; x < width; x++) {
                int i = y * width + x;
                row.append(i == start ? START : open[i] ? OPEN : ROCK);
            }
            rows.add(row.toString());
        }
        return rows;
    }

    public String layout() {
        return String.join(ROW_SEPARATOR, rows());
    }

    public int cells() {
        return width * height;
    }

    /** Orthogonal open neighbours of cell i. */
    public int[] neighbours(int i) {
        int x = i % width, y = i / width;
        int[] out = new int[4];
        int n = 0;
        if (y > 0 && open[i - width]) out[n++] = i - width;
        if (y < height - 1 && open[i + width]) out[n++] = i + width;
        if (x > 0 && open[i - 1]) out[n++] = i - 1;
        if (x < width - 1 && open[i + 1]) out[n++] = i + 1;
        return Arrays.copyOf(out, n);
    }

    public boolean adjacent(int a, int b) {
        return Math.abs(a % width - b % width) + Math.abs(a / width - b / width) == 1;
    }
}
