package com.poscashier.modules.receipt.dto;

import com.poscashier.modules.payment.dto.PaymentResponse;
import com.poscashier.modules.pos.dto.OrderResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ReceiptResponse {

    private OrderResponse order;
    private List<PaymentResponse> payments;
    private String receiptNumber;
    private String printedAt;
}
