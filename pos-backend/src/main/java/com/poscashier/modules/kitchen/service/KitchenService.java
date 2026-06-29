package com.poscashier.modules.kitchen.service;

import com.poscashier.modules.pos.dto.OrderResponse;
import com.poscashier.modules.pos.entity.PosOrder;
import com.poscashier.modules.pos.entity.PosOrderItem;
import com.poscashier.modules.pos.repository.PosOrderItemRepository;
import com.poscashier.modules.pos.repository.PosOrderRepository;
import com.poscashier.shared.exception.AppException;
import com.poscashier.shared.util.BranchContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class KitchenService {

    private static final Set<String> ALLOWED = Set.of("PENDING", "PREPARING", "READY", "SERVED");

    private final PosOrderRepository orderRepository;
    private final PosOrderItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<OrderResponse> queue(Long branchId) {
        Long resolved = BranchContext.resolveBranchId(branchId);
        return orderRepository.findKitchenQueue(resolved).stream()
                .map(o -> OrderResponse.from(o, itemRepository.findByOrderId(o.getId())))
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, String kitchenStatus) {
        if (!ALLOWED.contains(kitchenStatus)) {
            throw new AppException("Invalid kitchen status", HttpStatus.BAD_REQUEST);
        }
        PosOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException("Order not found", HttpStatus.NOT_FOUND));
        BranchContext.assertBranchAccess(order.getBranchId());
        if (order.getKitchenStatus() == null) {
            throw new AppException("Order is not a kitchen order", HttpStatus.BAD_REQUEST);
        }

        order.setKitchenStatus(kitchenStatus);
        List<PosOrderItem> items = itemRepository.findByOrderId(orderId);
        items.forEach(i -> i.setKitchenStatus(kitchenStatus));
        itemRepository.saveAll(items);
        orderRepository.save(order);
        return OrderResponse.from(order, items);
    }
}
