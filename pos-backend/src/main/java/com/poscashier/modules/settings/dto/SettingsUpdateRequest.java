package com.poscashier.modules.settings.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Map;

@Data
public class SettingsUpdateRequest {

    @NotEmpty
    private Map<String, String> settings;
}
