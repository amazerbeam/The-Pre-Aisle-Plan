package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * MPP-10: the Manage extras popup for one week or one template.
 * Only meals that have at least one extra are listed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManageExtrasViewDTO {
    private String scope;          // "WEEK" | "TEMPLATE"
    private LocalDate startDate;   // WEEK only
    private LocalDate endDate;     // WEEK only, inclusive (start + 6)
    private Long templateId;       // TEMPLATE only
    private String templateName;   // TEMPLATE only

    @Builder.Default
    private List<ManageExtrasMealDTO> meals = new ArrayList<>(); // ordered by date/dayOffset, then meal id
}
