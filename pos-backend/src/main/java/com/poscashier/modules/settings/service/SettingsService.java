package com.poscashier.modules.settings.service;

import com.poscashier.modules.settings.dto.SettingsResponse;
import com.poscashier.modules.settings.dto.SettingsUpdateRequest;
import com.poscashier.modules.settings.entity.Setting;
import com.poscashier.modules.settings.repository.SettingRepository;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SettingRepository settingRepository;

    @Transactional(readOnly = true)
    public SettingsResponse getAll() {
        Map<String, String> map = new LinkedHashMap<>();
        settingRepository.findAll().forEach(s -> map.put(s.getSettingKey(), s.getSettingValue()));
        return SettingsResponse.builder().settings(map).build();
    }

    @Transactional
    public SettingsResponse update(SettingsUpdateRequest request) {
        User user = SecurityUtils.getCurrentUser();
        request.getSettings().forEach((key, value) -> {
            Setting setting = settingRepository.findBySettingKey(key)
                    .orElse(Setting.builder().settingKey(key).build());
            setting.setSettingValue(value);
            setting.setUpdatedAt(LocalDateTime.now());
            setting.setUpdatedBy(user.getUsername());
            settingRepository.save(setting);
        });
        return getAll();
    }
}
