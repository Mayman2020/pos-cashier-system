package com.poscashier.modules.pos.dto;

import com.poscashier.modules.pos.entity.OrderNote;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrderNoteResponse {

    private Long id;
    private Long itemId;
    private String note;
    private LocalDateTime createdAt;
    private String createdBy;

    public static OrderNoteResponse from(OrderNote note) {
        return OrderNoteResponse.builder()
                .id(note.getId())
                .itemId(note.getItemId())
                .note(note.getNote())
                .createdAt(note.getCreatedAt())
                .createdBy(note.getCreatedBy())
                .build();
    }
}
