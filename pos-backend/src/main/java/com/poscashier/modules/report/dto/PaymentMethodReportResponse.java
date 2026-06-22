package com.poscashier.modules.report.dto;

import com.poscashier.shared.enums.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentMethodReportResponse {

    private PaymentMethod paymentMethod;
    private long transactionCount;
    private BigDecimal totalAmount;
}
