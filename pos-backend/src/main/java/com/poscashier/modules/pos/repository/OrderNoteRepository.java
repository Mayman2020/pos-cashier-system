package com.poscashier.modules.pos.repository;

import com.poscashier.modules.pos.entity.OrderNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderNoteRepository extends JpaRepository<OrderNote, Long> {

    List<OrderNote> findByOrderIdOrderByCreatedAtAsc(Long orderId);

    void deleteByOrderId(Long orderId);
}
