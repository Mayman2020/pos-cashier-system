package com.poscashier.modules.settings.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class SettingsResponse {

    private Map<String, String> settings;
}
