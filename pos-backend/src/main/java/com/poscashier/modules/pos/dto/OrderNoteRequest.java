package com.poscashier.modules.pos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OrderNoteRequest {

    private Long itemId;

    @NotBlank
    @Size(max = 1000)
    private String note;
}
