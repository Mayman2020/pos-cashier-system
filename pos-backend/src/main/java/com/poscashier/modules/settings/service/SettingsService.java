package com.poscashier.modules.settings.service;

import com.poscashier.modules.settings.dto.SettingsResponse;
import com.poscashier.modules.settings.dto.SettingsUpdateRequest;
import com.poscashier.modules.audit.service.AuditLogService;
import com.poscashier.modules.settings.entity.Setting;
import com.poscashier.modules.settings.repository.SettingRepository;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.exception.AppException;
import com.poscashier.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private static final Set<String> POS_READ_KEYS = Set.of(
            "tax_inclusive", "restaurant_mode", "supermarket_mode", "allow_manual_discount",
            "loyalty_points_per_currency", "loyalty_redeem_value", "currency", "cash_variance_threshold"
    );

    private static final Set<String> MANAGER_ALLOWED_KEYS = Set.of(
            "business_name", "currency", "tax_inclusive", "low_stock_alert",
            "restaurant_mode", "supermarket_mode", "loyalty_points_per_currency",
            "loyalty_redeem_value", "cash_variance_threshold", "allow_manual_discount"
    );

    private final SettingRepository settingRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public SettingsResponse getAll() {
        Map<String, String> map = new LinkedHashMap<>();
        settingRepository.findAll().forEach(s -> map.put(s.getSettingKey(), s.getSettingValue()));
        return SettingsResponse.builder().settings(map).build();
    }

    @Transactional(readOnly = true)
    public SettingsResponse getPosSettings() {
        Map<String, String> map = new LinkedHashMap<>();
        POS_READ_KEYS.forEach(key -> map.put(key, getString(key, "")));
        return SettingsResponse.builder().settings(map).build();
    }

    @Transactional
    public SettingsResponse update(SettingsUpdateRequest request) {
        User user = SecurityUtils.getCurrentUser();
        boolean isAdmin = SecurityUtils.hasRole(user, "ADMIN");
        request.getSettings().forEach((key, value) -> {
            if (!isAdmin && !MANAGER_ALLOWED_KEYS.contains(key)) {
                throw AppException.forbidden("Managers cannot update setting: " + key);
            }
            Setting setting = settingRepository.findBySettingKey(key)
                    .orElse(Setting.builder().settingKey(key).build());
            setting.setSettingValue(value);
            setting.setUpdatedAt(LocalDateTime.now());
            setting.setUpdatedBy(user.getUsername());
            settingRepository.save(setting);
        });
        auditLogService.record("UPDATE", "SETTINGS", null, "Settings updated", null);
        return getAll();
    }

    @Transactional(readOnly = true)
    public String getString(String key, String defaultValue) {
        return settingRepository.findBySettingKey(key)
                .map(Setting::getSettingValue)
                .orElse(defaultValue);
    }

    @Transactional(readOnly = true)
    public boolean getBoolean(String key, boolean defaultValue) {
        String value = getString(key, String.valueOf(defaultValue));
        return "true".equalsIgnoreCase(value) || "1".equals(value);
    }

    @Transactional(readOnly = true)
    public BigDecimal getDecimal(String key, BigDecimal defaultValue) {
        String value = getString(key, null);
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
