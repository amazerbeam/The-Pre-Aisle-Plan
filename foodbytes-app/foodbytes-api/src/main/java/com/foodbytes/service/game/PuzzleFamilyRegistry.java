package com.foodbytes.service.game;

import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/** MPP-49: every shipped PuzzleFamily bean, in chapter order. Fails at startup on a duplicate id or chapter. */
@Component
public class PuzzleFamilyRegistry {

    private final List<PuzzleFamily> ordered;

    public PuzzleFamilyRegistry(List<PuzzleFamily> families) {
        Set<String> ids = new HashSet<>();
        Set<Integer> chapters = new HashSet<>();
        for (PuzzleFamily family : families) {
            if (!ids.add(family.id())) throw new IllegalStateException("Duplicate puzzle family id: " + family.id());
            if (!chapters.add(family.chapter())) throw new IllegalStateException("Duplicate chapter: " + family.chapter());
        }
        this.ordered = families.stream().sorted(Comparator.comparingInt(PuzzleFamily::chapter)).toList();
    }

    public List<PuzzleFamily> ordered() {
        return ordered;
    }

    public Optional<PuzzleFamily> byId(String id) {
        return ordered.stream().filter(family -> family.id().equals(id)).findFirst();
    }
}
