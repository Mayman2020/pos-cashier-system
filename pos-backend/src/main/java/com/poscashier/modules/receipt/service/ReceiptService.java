package com.poscashier.modules.receipt.service;

import com.poscashier.modules.payment.service.PaymentService;
import com.poscashier.modules.pos.service.PosOrderService;
import com.poscashier.modules.receipt.dto.ReceiptResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final PosOrderService posOrderService;
    private final PaymentService paymentService;

    @Transactional(readOnly = true)
    public ReceiptResponse getReceipt(Long orderId) {
        var order = posOrderService.getById(orderId);
        return ReceiptResponse.builder()
                .order(order)
                .payments(paymentService.getByOrderId(orderId))
                .receiptNumber("RCP-" + order.getOrderNumber())
                .printedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }
}
