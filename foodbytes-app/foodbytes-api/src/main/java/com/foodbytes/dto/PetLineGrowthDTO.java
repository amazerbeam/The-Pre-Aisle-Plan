package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One Pip line's growth (herb, dragon, robot). Built only by PetGrowthPolicy#lineGrowth. The form
 * comes from the peak total, so it never drops; the bar shows the current points and can drain.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetLineGrowthDTO {
    private int form;            // 1..last form of the line, from the effective peak
    private int peakForm;        // equals form (form is peak-based)
    private int formStart;       // points at which this form begins
    private Integer barCurrent;  // max(0, points - formStart); null at the line's last form
    private Integer barSize;     // next threshold - formStart; null at the line's last form
    private boolean fullyGrown;  // the line's last currently defined form is reached
}
